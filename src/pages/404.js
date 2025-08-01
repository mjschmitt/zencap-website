import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import SEO from '@/components/SEO';

export default function Custom404() {
  return (
    <Layout>
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Explore our financial modeling and investment advisory services."
        noIndex={true}
      />
      
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up" duration={800}>
            <div className="mb-8">
              <h1 className="text-9xl font-bold text-navy-700 dark:text-white mb-4">
                404
              </h1>
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Page Not Found
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                The page you&apos;re looking for doesn&apos;t exist. Let us help you find what you need.
              </p>
            </div>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Button href="/models" variant="primary" className="w-full">
                Financial Models
              </Button>
              <Button href="/solutions" variant="primary" className="w-full">
                Our Solutions
              </Button>
              <Button href="/insights" variant="primary" className="w-full">
                Market Insights
              </Button>
            </div>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400} duration={800}>
            <div className="space-y-4">
              <Button href="/" variant="accent" size="lg">
                Return Home
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Or contact us directly at{' '}
                <a href="mailto:info@zencap.co" className="text-teal-500 hover:text-teal-600">
                  info@zencap.co
                </a>
              </p>
            </div>
          </Motion>
        </div>
      </div>
    </Layout>
  );
} 