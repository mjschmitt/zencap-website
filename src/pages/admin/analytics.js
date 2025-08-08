// Admin Analytics Dashboard Page
import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import ExecutiveAnalyticsDashboard from '@/components/dashboard/ExecutiveAnalyticsDashboard';
import { getAnalytics } from '@/utils/advancedAnalytics';
import { getHeatMapTracker } from '@/utils/heatMapping';

export default function AnalyticsDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Track page view with analytics
    if (typeof window !== 'undefined') {
      const analytics = getAnalytics();
      analytics.trackPageView({
        page_path: '/admin/analytics',
        page_title: 'Analytics Dashboard',
        content_group1: 'admin',
        content_group2: 'analytics'
      });

      // Initialize heat mapping for admin interface
      const heatMapTracker = getHeatMapTracker();
      if (heatMapTracker) {
        // Track specific admin interactions
        heatMapTracker.trackElementInteraction('.analytics-tab', 'tab_click');
        heatMapTracker.trackElementInteraction('.metric-card', 'metric_view');
        heatMapTracker.trackElementInteraction('.chart-container', 'chart_interaction');
      }
    }
  }, []);

  if (!mounted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ExecutiveAnalyticsDashboard />
      </div>
    </Layout>
  );
}

// Server-side authentication check
export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  // Check if user is authenticated and has admin role
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  // For now, we'll allow all authenticated users
  // In production, add role-based access control
  // if (session.user.role !== 'admin') {
  //   return {
  //     redirect: {
  //       destination: '/',
  //       permanent: false,
  //     },
  //   };
  // }

  return {
    props: {
      session,
    },
  };
}