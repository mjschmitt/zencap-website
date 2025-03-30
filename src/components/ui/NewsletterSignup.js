// src/components/ui/NewsletterSignup.js
import { useState } from 'react';
import Button from './Button';

export default function NewsletterSignup({ dark = false }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    setStatus('loading');
    
    try {
      // This would be an API call in a real application
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('Error submitting form:', err);
      setStatus('error');
      setErrorMessage('Failed to subscribe. Please try again.');
    }
  };
  
  return (
    <div className={`py-8 px-6 ${dark ? 'bg-navy-800 text-white' : 'bg-gray-50'} rounded-lg`}>
      <h3 className={`text-xl font-bold ${dark ? 'text-white' : 'text-navy-700'} mb-2`}>
        Subscribe to our Newsletter
      </h3>
      <p className={`mb-4 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
        Receive financial modeling insights and investment tips directly to your inbox
      </p>
      
      {status === 'success' ? (
        <div className="bg-green-100 border border-green-200 text-green-800 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Thanks for subscribing!</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                status === 'error' ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {status === 'error' && (
              <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
          
          <Button
            type="submit"
            variant={dark ? 'accent' : 'primary'}
            fullWidth={true}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subscribing...
              </>
            ) : 'Subscribe'}
          </Button>
        </form>
      )}
    </div>
  );
}