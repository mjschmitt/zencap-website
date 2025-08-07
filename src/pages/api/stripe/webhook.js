import Stripe from 'stripe';
import { buffer } from 'micro';
import { sendEmail, emailTemplates } from '@/utils/email';

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
  // This would typically record the purchase in your database
  // For now, we'll just log it
  console.log('Recording purchase:', {
    sessionId: session.id,
    customerEmail: session.customer_email,
    amountTotal: session.amount_total,
    modelId: session.metadata.modelId,
    modelSlug: session.metadata.modelSlug,
    customerName: session.metadata.customerName,
  });
  
  // TODO: Add database record
  // await database.purchases.create({
  //   stripe_session_id: session.id,
  //   customer_email: session.customer_email,
  //   amount_paid: session.amount_total,
  //   model_id: session.metadata.modelId,
  //   model_slug: session.metadata.modelSlug,
  //   customer_name: session.metadata.customerName,
  //   status: 'completed',
  //   purchase_date: new Date(),
  // });
}

async function sendPurchaseConfirmation(session) {
  try {
    const customerEmail = session.customer_email;
    const customerName = session.metadata.customerName || 'Valued Customer';
    const modelTitle = session.line_items?.data?.[0]?.description || 'Financial Model';
    
    if (customerEmail) {
      await sendEmail(
        customerEmail,
        `Purchase Confirmation - ${modelTitle}`,
        emailTemplates.purchaseConfirmation(customerName, modelTitle, session.id),
        emailTemplates.purchaseConfirmationHtml(customerName, modelTitle, session.id)
      );
      
      console.log('Purchase confirmation email sent to:', customerEmail);
    }
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
  }
}