// src/pages/auth/verify-request.js
import Layout from '@/components/layout/Layout';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function VerifyRequest() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full">
              <EnvelopeIcon className="h-8 w-8 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Check your email
            </h1>
            
            <p className="text-gray-600 mb-6">
              A sign in link has been sent to your email address.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p>Click the link in your email to complete the sign-in process.</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p className="mb-2">
                If you don't see the email, check your spam folder or try signing in again.
              </p>
              <p>
                The sign-in link will expire in 24 hours for security reasons.
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <a
                href="/auth/signin"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                ← Back to sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}