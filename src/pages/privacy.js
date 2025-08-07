import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import Motion from '@/components/ui/Motion';

export default function Privacy() {
  return (
    <Layout>
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for Zenith Capital Advisors - How we collect, use, and protect your personal information."
        noIndex={false}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up" duration={800}>
            <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg p-8 md:p-12">
              <h1 className="text-4xl font-bold text-navy-700 dark:text-white mb-8">
                Privacy Policy
              </h1>
              
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                </p>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    1. Introduction
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Zenith Capital Advisors LLC (&quot;ZenCap,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    2. Information We Collect
                  </h2>
                  
                  <h3 className="text-xl font-semibold text-navy-600 dark:text-white mb-3">
                    Personal Information
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We collect personal information that you voluntarily provide to us, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li>Name and contact information (email address, phone number)</li>
                    <li>Company information and job title</li>
                    <li>Payment information (processed securely through Stripe)</li>
                    <li>Communication preferences and newsletter subscriptions</li>
                    <li>Information provided through contact forms and customer support</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-navy-600 dark:text-white mb-3">
                    Automatically Collected Information
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    When you visit our website, we automatically collect certain information:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li>IP address and geolocation data</li>
                    <li>Browser type and version</li>
                    <li>Device information and operating system</li>
                    <li>Website usage patterns and analytics data</li>
                    <li>Referral sources and exit pages</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    3. How We Use Your Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We use your information for the following purposes:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li>Process and fulfill your orders for financial models and services</li>
                    <li>Send order confirmations, delivery notifications, and customer support</li>
                    <li>Provide customer service and respond to your inquiries</li>
                    <li>Send marketing communications and newsletters (with your consent)</li>
                    <li>Improve our website functionality and user experience</li>
                    <li>Analyze website usage and generate business insights</li>
                    <li>Comply with legal obligations and prevent fraudulent activity</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    4. Information Sharing and Disclosure
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
                  </p>
                  
                  <h3 className="text-xl font-semibold text-navy-600 dark:text-white mb-3">
                    Service Providers
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li><strong>Stripe:</strong> Payment processing and transaction management</li>
                    <li><strong>SendGrid:</strong> Email delivery and communication services</li>
                    <li><strong>Vercel:</strong> Website hosting and performance optimization</li>
                    <li><strong>Google Analytics:</strong> Website analytics and usage tracking</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-navy-600 dark:text-white mb-3">
                    Legal Requirements
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We may disclose your information when required by law, court order, or to protect our rights, property, or safety, or that of others.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    5. Data Security
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We implement appropriate technical and organizational security measures to protect your personal information:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li>SSL/TLS encryption for all data transmission</li>
                    <li>Secure payment processing through PCI-compliant providers</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls and employee training on data protection</li>
                    <li>Secure cloud infrastructure with backup and recovery systems</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    6. Cookies and Tracking Technologies
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We use cookies and similar technologies to enhance your browsing experience:
                  </p>
                  
                  <h3 className="text-xl font-semibold text-navy-600 dark:text-white mb-3">
                    Types of Cookies
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand website usage patterns</li>
                    <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  </ul>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    You can control cookie preferences through your browser settings. However, disabling certain cookies may affect website functionality.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    7. GDPR Compliance (European Users)
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    If you are located in the European Economic Area (EEA), you have the following rights under GDPR:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Right of Rectification:</strong> Correct inaccurate or incomplete data</li>
                    <li><strong>Right of Erasure:</strong> Request deletion of your personal data</li>
                    <li><strong>Right of Portability:</strong> Receive your data in a structured format</li>
                    <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                    <li><strong>Right to Object:</strong> Opt out of certain data processing activities</li>
                  </ul>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    To exercise these rights, please contact us at info@zencap.co. We will respond within 30 days of your request.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    8. Data Retention
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li><strong>Customer Data:</strong> 7 years for tax and legal compliance</li>
                    <li><strong>Marketing Data:</strong> Until you unsubscribe or request deletion</li>
                    <li><strong>Website Analytics:</strong> 26 months for Google Analytics data</li>
                    <li><strong>Support Communications:</strong> 3 years for quality assurance</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    9. Third-Party Links
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies before providing any personal information.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    10. Children&apos;s Privacy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it promptly.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    11. Changes to This Privacy Policy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the updated policy on our website with a new effective date.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    12. Contact Us
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    If you have questions about this Privacy Policy or how we handle your personal information, please contact us:
                  </p>
                  <div className="bg-gray-50 dark:bg-navy-700 rounded-lg p-6">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Zenith Capital Advisors LLC</strong><br/>
                      Privacy Officer<br/>
                      Email: <a href="mailto:info@zencap.co" className="text-teal-500 hover:text-teal-600">info@zencap.co</a><br/>
                      Website: <a href="https://zencap.co" className="text-teal-500 hover:text-teal-600">zencap.co</a>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Please allow 1-2 business days for a response to privacy-related inquiries.
                    </p>
                  </div>
                </section>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-8 mt-12">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    © {new Date().getFullYear()} Zenith Capital Advisors LLC. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </Motion>
        </div>
      </div>
    </Layout>
  );
}