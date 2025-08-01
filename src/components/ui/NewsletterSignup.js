// src/components/ui/NewsletterSignup.js
import { useState } from 'react';
import Button from './Button';

export default function NewsletterSignup() {
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
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
      setStatus('success');
      setEmail('');
        setErrorMessage('');
      } else {
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      console.error('Error submitting newsletter form:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to subscribe. Please try again.');
    }
  };
  
  return (
    <div className="py-8 px-6 bg-gray-50 dark:bg-navy-700 text-navy-700 dark:text-white rounded-lg border border-gray-100 dark:border-navy-600 shadow-md">
      <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
        Subscribe to our Newsletter
      </h3>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Receive financial modeling insights and investment tips directly to your inbox
      </p>
      
      {status === 'success' ? (
        <div className="bg-green-100 border border-green-200 text-green-800 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Thanks for subscribing! You&apos;ll receive our latest insights soon.</span>
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
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 transition-colors
                ${status === 'error' ? 'border-red-500' : 'border-gray-300 dark:border-navy-600'}
                bg-white text-gray-900 placeholder-gray-500
                dark:bg-navy-900 dark:text-white dark:placeholder-gray-400`
              }
            />
            {status === 'error' && (
              <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
          
          <Button
            type="submit"
            variant="accent"
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