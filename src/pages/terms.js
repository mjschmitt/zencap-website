import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import Motion from '@/components/ui/Motion';

export default function Terms() {
  return (
    <Layout>
      <SEO
        title="Terms of Service"
        description="Terms of Service for Zenith Capital Advisors - Professional financial modeling services and digital product terms."
        noIndex={false}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up" duration={800}>
            <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg p-8 md:p-12">
              <h1 className="text-4xl font-bold text-navy-700 dark:text-white mb-8">
                Terms of Service
              </h1>
              
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                </p>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    1. Agreement to Terms
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    By accessing or using the services provided by Zenith Capital Advisors LLC (&quot;ZenCap,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    2. Description of Services
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    ZenCap provides premium financial modeling services, investment research, and digital downloadable Excel-based financial models ranging from $2,985 to $4,985. Our services include:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li>Private equity financial models (real estate, multifamily, commercial, hospitality)</li>
                    <li>Public equity analytical tools and DCF models</li>
                    <li>Investment advisory insights and research</li>
                    <li>Custom financial modeling solutions</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    3. Digital Product Terms
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    All financial models and digital products are delivered as downloadable Excel files. Upon purchase:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li>You receive a perpetual license to use the model for your internal business purposes</li>
                    <li>Models may not be redistributed, resold, or shared with third parties</li>
                    <li>Modifications to models are permitted for your internal use only</li>
                    <li>Download links are provided immediately after successful payment</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    4. Payment and Refund Policy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Payments are processed securely through Stripe. Our refund policy is as follows:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li>Digital products: 7-day money-back guarantee if the model does not function as described</li>
                    <li>Refunds must be requested via email to info@zencap.co with a detailed explanation</li>
                    <li>Custom modeling services: 50% refund available within 48 hours of project initiation</li>
                    <li>Refunds are processed within 5-10 business days</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    5. Intellectual Property Rights
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    All financial models, methodologies, research, and content provided by ZenCap are protected by intellectual property laws. You acknowledge that:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li>ZenCap retains all ownership rights to our proprietary models and methodologies</li>
                    <li>Purchase grants usage rights only, not ownership of intellectual property</li>
                    <li>Reverse engineering or copying our model structures is prohibited</li>
                    <li>Attribution to ZenCap is required when using our models in external presentations</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    6. Investment Disclaimer
                  </h2>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-4">
                    <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                      IMPORTANT DISCLAIMER:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      The financial models and information provided by ZenCap are for educational and analytical purposes only. They do not constitute investment advice, recommendations, or solicitations. All investment decisions should be made in consultation with qualified financial advisors. Past performance does not guarantee future results. ZenCap is not a registered investment advisor.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    7. User Responsibilities
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    By using our services, you agree to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 ml-4">
                    <li>Provide accurate information during purchase and communication</li>
                    <li>Use our models responsibly and in accordance with applicable laws</li>
                    <li>Not attempt to circumvent security measures or access restrictions</li>
                    <li>Respect our intellectual property rights and usage limitations</li>
                    <li>Notify us immediately of any unauthorized access to your account</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    8. Limitation of Liability
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    ZenCap&apos;s liability is limited to the amount paid for our services. We are not liable for any indirect, incidental, or consequential damages, including but not limited to lost profits, business interruption, or investment losses resulting from the use of our models or services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    9. Privacy and Data Protection
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We are committed to protecting your privacy and complying with applicable data protection laws, including GDPR where applicable. Please review our Privacy Policy for detailed information about how we collect, use, and protect your personal information.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    10. Changes to Terms
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated effective date. Continued use of our services after changes constitute acceptance of the modified terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
                    11. Contact Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    For questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-gray-50 dark:bg-navy-700 rounded-lg p-6">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Zenith Capital Advisors LLC</strong><br/>
                      Email: <a href="mailto:info@zencap.co" className="text-teal-500 hover:text-teal-600">info@zencap.co</a><br/>
                      Website: <a href="https://zencap.co" className="text-teal-500 hover:text-teal-600">zencap.co</a>
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