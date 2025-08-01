// src/components/ui/ContactForm.js - Integrated with formHandlers utility
import { useState } from 'react';
import Button from './Button';
import { submitContactForm, trackFormEvent, sanitizeFormData } from '@/utils/formHandlers';

export default function ContactForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    interest: 'general',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      
      try {
        // Sanitize form data
        const sanitizedData = sanitizeFormData(formData);
        
        // Submit form using utility function
        const result = await submitContactForm(sanitizedData);
        
        if (result.success) {
        setSubmitSuccess(true);
          
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          company: '',
          interest: 'general',
          message: ''
        });
        
        if (onSubmit) {
            onSubmit(sanitizedData);
        }
          
          // Track successful submission
          trackFormEvent('form_submit', {
            form_name: 'contact_form',
            form_id: 'contact',
            interest: sanitizedData.interest,
            method: result.method
          });
          
        } else {
          throw new Error('Form submission failed');
        }
        
      } catch (err) {
        console.error('Error submitting form:', err);
        setErrors({ submit: 'Failed to send message. Please try again.' });
        
        // Track form error
        trackFormEvent('form_error', {
          form_name: 'contact_form',
          form_id: 'contact',
          error_message: err.message
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div>
      {submitSuccess ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium">Message sent successfully!</p>
              <p className="text-sm mt-1">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
              <button 
                onClick={() => setSubmitSuccess(false)}
                className="mt-2 text-sm font-medium text-green-700 hover:text-green-900"
              >
                Send another message
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy-600 dark:text-gray-200 mb-1">
                Full Name*
              </label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors
                  ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-navy-600'}
                  bg-white text-gray-900 placeholder-gray-500
                  dark:bg-navy-900 dark:text-white dark:placeholder-gray-400`
                }
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-600 dark:text-gray-200 mb-1">
                Email Address*
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors
                  ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-navy-600'}
                  bg-white text-gray-900 placeholder-gray-500
                  dark:bg-navy-900 dark:text-white dark:placeholder-gray-400`
                }
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-navy-600 dark:text-gray-200 mb-1">
                Company
              </label>
              <input 
                type="text" 
                id="company" 
                name="company" 
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </div>
            
            <div>
              <label htmlFor="interest" className="block text-sm font-medium text-navy-600 dark:text-gray-200 mb-1">
                I&apos;m interested in
              </label>
              <select 
                id="interest" 
                name="interest" 
                value={formData.interest}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              >
                <option value="general">General Inquiry</option>
                <option value="products">Financial Models</option>
                <option value="services">Custom Services</option>
                <option value="partnership">Partnership Opportunity</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-navy-600 dark:text-gray-200 mb-1">
              Message*
            </label>
            <textarea 
              id="message" 
              name="message" 
              rows="5" 
              value={formData.message}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors
                ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-navy-600'}
                bg-white text-gray-900 placeholder-gray-500
                dark:bg-navy-900 dark:text-white dark:placeholder-gray-400`
              }
              placeholder="Tell us about your project or how we can help..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>
          
          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p>{errors.submit}</p>
              </div>
            </div>
          )}
          
          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : 'Send Message'}
          </Button>
        </form>
      )}
    </div>
  );
}