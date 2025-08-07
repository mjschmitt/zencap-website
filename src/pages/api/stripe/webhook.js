import Stripe from 'stripe';
import { buffer } from 'micro';
import { sendOrderConfirmationEmail } from '@/utils/email';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Initialize Stripe inside the handler with explicit API version
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      try {
        // Record the purchase in database
        await recordPurchase(session);
        
        // Send confirmation email
        await sendPurchaseConfirmation(session);
        
        console.log('Purchase processed successfully:', session.id);
      } catch (error) {
        console.error('Error processing purchase:', error);
      }
      break;
      
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

async function recordPurchase(session) {
  const { sql } = require('@vercel/postgres');
  const { createAuditLog } = require('@/utils/audit');
  
  try {
    console.log('Recording purchase:', {
      sessionId: session.id,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      modelId: session.metadata?.modelId,
      modelSlug: session.metadata?.modelSlug,
    });

    // Create or get customer record
    let customer;
    try {
      const customerResult = await sql`
        INSERT INTO customers (stripe_customer_id, email, name, created_at, updated_at)
        VALUES (${session.customer}, ${session.customer_email}, ${session.metadata?.customerName || 'Unknown'}, NOW(), NOW())
        ON CONFLICT (stripe_customer_id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          updated_at = NOW()
        RETURNING id;
      `;
      customer = customerResult.rows[0];
    } catch (customerError) {
      console.error('Error creating/updating customer:', customerError);
      // Try to get existing customer
      const existingCustomer = await sql`
        SELECT id FROM customers WHERE stripe_customer_id = ${session.customer} LIMIT 1;
      `;
      customer = existingCustomer.rows[0];
      
      if (!customer) {
        throw new Error('Failed to create or retrieve customer record');
      }
    }

    // Get model ID if provided
    let modelId = null;
    if (session.metadata?.modelSlug) {
      try {
        const modelResult = await sql`
          SELECT id FROM models WHERE slug = ${session.metadata.modelSlug} LIMIT 1;
        `;
        modelId = modelResult.rows[0]?.id || null;
      } catch (modelError) {
        console.warn('Error retrieving model ID:', modelError);
      }
    }

    // Record the order
    const orderResult = await sql`
      INSERT INTO orders (
        stripe_session_id,
        stripe_payment_intent_id,
        customer_id,
        model_id,
        model_slug,
        amount,
        currency,
        status,
        download_expires_at,
        metadata,
        created_at,
        updated_at
      ) VALUES (
        ${session.id},
        ${session.payment_intent},
        ${customer.id},
        ${modelId},
        ${session.metadata?.modelSlug || null},
        ${session.amount_total},
        ${session.currency || 'usd'},
        'completed',
        ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}, -- 7 days from now
        ${JSON.stringify(session.metadata || {})},
        NOW(),
        NOW()
      )
      ON CONFLICT (stripe_session_id) DO UPDATE SET
        status = 'completed',
        stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
        updated_at = NOW()
      RETURNING id;
    `;

    const order = orderResult.rows[0];

    // Create security audit log
    await createAuditLog({
      event: 'PURCHASE_COMPLETED',
      userId: customer.id,
      resourceType: 'order',
      resourceId: order.id.toString(),
      action: 'create',
      result: 'success',
      severity: 'info',
      metadata: {
        stripeSessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
        modelSlug: session.metadata?.modelSlug
      }
    });

    console.log('Purchase recorded successfully:', {
      orderId: order.id,
      customerId: customer.id,
      sessionId: session.id
    });

    return order;

  } catch (error) {
    console.error('Error recording purchase:', error);
    
    // Create error audit log
    await createAuditLog({
      event: 'PURCHASE_ERROR',
      resourceType: 'order',
      action: 'create',
      result: 'failure',
      severity: 'error',
      metadata: {
        stripeSessionId: session.id,
        error: error.message
      },
      errorDetails: {
        message: error.message,
        stack: error.stack
      }
    }).catch(auditError => {
      console.error('Failed to create audit log:', auditError);
    });
    
    // Re-throw to ensure webhook fails and Stripe retries
    throw error;
  }
}

async function sendPurchaseConfirmation(session) {
  try {
    const customerEmail = session.customer_email;
    const customerName = session.metadata.customerName || 'Valued Customer';
    const modelTitle = session.line_items?.data?.[0]?.description || session.metadata.modelTitle || 'Financial Model';
    
    if (customerEmail) {
      const orderData = {
        customerEmail,
        customerName,
        modelTitle,
        orderId: session.id,
        downloadUrl: session.metadata.downloadUrl || '',
        purchaseAmount: session.amount_total
      };

      await sendOrderConfirmationEmail(orderData);
      console.log('Purchase confirmation email sent to:', customerEmail);
    } else {
      console.warn('No customer email found in session:', session.id);
    }
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
    // Don't throw error - log and continue
  }
}