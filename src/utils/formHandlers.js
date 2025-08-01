// src/utils/formHandlers.js - Form submission utilities with database-first approach

/**
 * Submit contact form with database-first approach
 */
export async function submitContactForm(formData) {
  const customEndpoint = '/api/contact';
  const formspreeEndpoint = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT;

  // Try custom API first (database approach)
  try {
    const response = await fetch(customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, method: 'database', data: result };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Database submission failed');
    }
  } catch (error) {
    console.warn('Database submission failed, trying Formspree:', error);
    
    // Fallback to Formspree if database fails
    if (formspreeEndpoint) {
      try {
        const response = await fetch(formspreeEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            _subject: `New Contact Form Submission from ${formData.name}`,
            _captcha: false,
          }),
        });

        if (response.ok) {
          return { success: true, method: 'formspree' };
        }
      } catch (formspreeError) {
        console.error('Formspree fallback also failed:', formspreeError);
      }
    }
    
    throw error;
  }
}

/**
 * Submit newsletter subscription with database-first approach
 */
export async function submitNewsletterSubscription(email) {
  const customEndpoint = '/api/newsletter';
  const formspreeEndpoint = process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT;

  // Try custom API first (database approach)
  try {
    const response = await fetch(customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, method: 'database', data: result };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Database submission failed');
    }
  } catch (error) {
    console.warn('Database submission failed, trying Formspree:', error);
    
    // Fallback to Formspree if database fails
    if (formspreeEndpoint) {
      try {
        const response = await fetch(formspreeEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            _subject: 'New Newsletter Subscription',
            _captcha: false,
          }),
        });

        if (response.ok) {
          return { success: true, method: 'formspree' };
        }
      } catch (formspreeError) {
        console.error('Formspree fallback also failed:', formspreeError);
      }
    }
    
    throw error;
  }
}

/**
 * Track form analytics events
 */
export function trackFormEvent(eventName, formData = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: formData.interest || formData.form_type || 'form_submission',
      value: 1,
      custom_parameters: {
        form_name: formData.form_name || 'unknown',
        form_id: formData.form_id || 'unknown',
        method: formData.method || 'unknown'
      }
    });
  }
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize form data
 */
export function sanitizeFormData(data) {
  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      // Basic sanitization - remove script tags and excessive whitespace
      sanitized[key] = data[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .trim();
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
}

/**
 * Test database connection
 */
export async function testDatabaseConnection() {
  try {
    const response = await fetch('/api/init-db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DB_INIT_SECRET || 'your-secret-key'}`
      }
    });

    if (response.ok) {
      return { success: true, message: 'Database connection successful' };
    } else {
      const error = await response.json();
      return { success: false, message: error.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
} 