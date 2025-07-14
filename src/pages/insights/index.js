// src/pages/insights/index.js - with larger hero background
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

// Updated insights data with tech-focused public equity and commercial real estate private equity content
const INSIGHTS = [
  {
    id: 'earnings-q1-2025-tech-giants',
    slug: 'earnings-q1-2025-tech-giants',
    title: 'Q1 2025 Earnings Snapshot: Major Tech Platforms',
    excerpt: 'Analysis of Q1 earnings reports from leading technology companies, highlighting key trends, surprises, and implications for investors.',
    category: 'Public Equity',
    date: 'March 30, 2025',
    readTime: '8 min read',
    featured: true,
    imagePlaceholder: 'Tech earnings chart',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'ai-impact-saas-valuations',
    slug: 'ai-impact-saas-valuations',
    title: "AI Impact on SaaS Valuations: A New Multiple Framework",
    excerpt: 'How AI capabilities are reshaping valuation multiples for software companies, with a proposed framework for measuring AI-driven value creation.',
    category: 'Public Equity',
    date: 'March 22, 2025',
    readTime: '10 min read',
    featured: true,
    imagePlaceholder: 'AI valuation model',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'multifamily-investment-interest-rates',
    slug: 'multifamily-investment-interest-rates',
    title: 'Multifamily Investments in a Shifting Rate Environment',
    excerpt: 'Analysis of how changing interest rates impact multifamily valuations, cash flows, and investment strategies in the current market.',
    category: 'Private Equity',
    date: 'March 15, 2025',
    readTime: '12 min read',
    featured: false,
    imagePlaceholder: 'Apartment building investments',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'semiconductor-supply-chain-resilience',
    slug: 'semiconductor-supply-chain-resilience',
    title: 'Semiconductor Supply Chain Resilience: Investment Implications',
    excerpt: 'Examining how geopolitical tensions and reshoring efforts are transforming semiconductor manufacturing investments and public equity valuations.',
    category: 'Public Equity',
    date: 'March 8, 2025',
    readTime: '9 min read',
    featured: false,
    imagePlaceholder: 'Semiconductor manufacturing',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'commercial-real-estate-data-centers',
    slug: 'commercial-real-estate-data-centers',
    title: 'Data Centers: The New Essential Commercial Real Estate',
    excerpt: 'How AI computing demands are driving unprecedented growth in data center development and creating compelling investment opportunities.',
    category: 'Private Equity',
    date: 'March 1, 2025',
    readTime: '11 min read',
    featured: false,
    imagePlaceholder: 'Data center infrastructure',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'fintech-embedded-finance-trends',
    slug: 'fintech-embedded-finance-trends',
    title: 'Embedded Finance: The Next Growth Vector for Fintech',
    excerpt: 'Analysis of how non-financial companies are integrating financial services, creating new revenue streams and investment opportunities.',
    category: 'Public Equity',
    date: 'February 22, 2025',
    readTime: '8 min read',
    featured: false,
    imagePlaceholder: 'Embedded finance diagram',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'industrial-real-estate-ecommerce',
    slug: 'industrial-real-estate-ecommerce',
    title: 'Industrial Real Estate: Riding the E-commerce Wave',
    excerpt: 'Examining how continued e-commerce growth is transforming industrial real estate demand, pricing dynamics, and investment strategies.',
    category: 'Private Equity',
    date: 'February 15, 2025',
    readTime: '10 min read',
    featured: false,
    imagePlaceholder: 'Modern logistics facility',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'cloud-infrastructure-pricing-models',
    slug: 'cloud-infrastructure-pricing-models',
    title: 'Cloud Infrastructure Pricing Models: Implications for Margins',
    excerpt: 'Analysis of how evolving cloud pricing strategies impact the profitability of major providers and influence enterprise technology decisions.',
    category: 'Public Equity',
    date: 'February 8, 2025',
    readTime: '9 min read',
    featured: false,
    imagePlaceholder: 'Cloud pricing dashboard',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  }
];

// Categories for filtering
const CATEGORIES = [
  { id: 'all', name: 'All Insights' },
  { id: 'public-equity', name: 'Public Equity' },
  { id: 'private-equity', name: 'Private Equity' },
  { id: 'technology', name: 'Technology' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'financial-markets', name: 'Financial Markets' }
];

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/insights')
      .then(res => res.json())
      .then(data => {
        setInsights(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="py-16 text-center text-gray-500">Loading insights...</div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Insights</h1>
      {insights.length === 0 ? (
        <div className="text-gray-500">No insights found.</div>
      ) : (
        <ul className="space-y-8">
          {insights.map(insight => (
            <li key={insight.id} className="bg-white dark:bg-navy-800 rounded-lg shadow p-6 border border-gray-100 dark:border-navy-700">
              <h2 className="text-xl font-semibold mb-2">{insight.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">{insight.summary}</p>
              <div className="text-sm text-gray-400 mb-2">By {insight.author} • {new Date(insight.published_at).toLocaleDateString()}</div>
              <a href={`/insights/${insight.slug}`} className="text-teal-600 dark:text-teal-400 hover:underline font-medium">Read more</a>
            </li>
          ))}
        </ul>
      )}
        </div>
  );
}