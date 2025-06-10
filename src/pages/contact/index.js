// src/pages/contact.js - with larger hero background
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Motion from '@/components/ui/Motion';
import Accordion from '@/components/ui/Accordion';
import ContactForm from '@/components/ui/ContactForm';
import SEO from '@/components/SEO';

export default function Contact() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  const faqItems = [
    {
      title: "What is the typical turnaround time for custom services?",
      content: "Our turnaround time varies based on the complexity of the project. For standard custom models, we typically deliver initial drafts within 1-2 weeks. For comprehensive infrastructure projects, the timeline is generally 4-8 weeks. During our initial consultation, we'll provide a specific estimate for your project."
    },
    {
      title: "Do you offer implementation support for your models?",
      content: "Yes, we provide comprehensive implementation support for all our models. This includes personalized training, documentation, and ongoing support to ensure your team can effectively use the models. For custom projects, we also offer extended support packages to help with integration into your existing systems."
    },
    {
      title: "Can you work with our existing templates and systems?",
      content: "Absolutely. We often work with clients to enhance or integrate with their existing financial models and systems. Our team is adept at adapting to your workflows and building solutions that complement your current processes."
    },
    {
      title: "How do you handle confidential financial information?",
      content: "We take data security very seriously. All client information is handled with strict confidentiality protocols. We use secure file sharing systems, sign NDAs when required, and can work with anonymized data when appropriate. Our team follows industry best practices for data protection throughout our engagement."
    }
  ];

  const handleFormSubmit = (formData) => {
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
  };

  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Zenith Capital Advisors",
    "description": "Get in touch with our team to discuss your financial modeling and investment advisory needs.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "telephone": "+1-555-123-4567",
      "email": "info@zencap.co",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Finance Street",
        "addressLocality": "New York",
        "addressRegion": "NY",
        "postalCode": "10001",
        "addressCountry": "US"
      }
    }
  };

  return (
    <Layout>
      <SEO
        title="Contact Us"
        description="Get in touch with our team to discuss your financial modeling and investment advisory needs."
        structuredData={structuredData}
      />
      
      {/* Page Header with Background Image */}
      <section 
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[60vh] md:min-h-[70vh] flex items-center"
        style={{ backgroundImage: 'url(/images/contact/contact-hero.jpg)' }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10 w-full">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Contact Us
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Let&apos;s discuss how we can elevate your investment process
            </p>
          </Motion>
        </div>
      </section>
      
      {/* Contact Form and Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <Motion animation="fade" direction="left" className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-navy-700 mb-6">
                  Send Us a Message
                </h2>
                <ContactForm onSubmit={handleFormSubmit} />
              </Card>
            </Motion>
            
            {/* Contact Information */}
            <Motion animation="fade" direction="right" className="space-y-6">
              <Card className="bg-navy-700 text-white p-6">
                <h3 className="text-xl font-bold mb-6">
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-teal-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h4 className="text-base font-medium mb-1">Email</h4>
                      <a href="mailto:info@zencap.co" className="text-gray-300 hover:text-white">
                        info@zencap.co
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-teal-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <h4 className="text-base font-medium mb-1">Phone</h4>
                      <a href="tel:+15551234567" className="text-gray-300 hover:text-white">
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-teal-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <h4 className="text-base font-medium mb-1">Address</h4>
                      <p className="text-gray-300">
                        123 Finance Street<br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <a 
                    href="https://calendly.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full py-3 px-4 bg-white text-navy-700 text-center font-medium rounded-md hover:bg-gray-100 transition duration-150 ease-in-out"
                  >
                    Schedule a Meeting
                  </a>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-bold text-navy-700 mb-4">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-navy-600 hover:text-navy-900">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-navy-600 hover:text-navy-900">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md p-6">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-navy-700 last:border-b-0 py-4">
                  <button
                    onClick={() => toggleItem(index)}
                    className="flex justify-between items-center w-full text-left font-medium text-navy-700 dark:text-white focus:outline-none bg-transparent"
                  >
                    <span>{item.title}</span>
                    <svg
                      className={`w-5 h-5 ml-2 text-teal-500 transform transition-transform duration-200 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === index ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="text-gray-600 dark:text-gray-300 text-sm">{item.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </Motion>
        </div>
      </section>
      
      {/* Map Section - Placeholder */}
      <div className="h-80 bg-gray-200 flex items-center justify-center text-gray-500 text-lg">
        [Google Map Would Go Here]
      </div>
    </Layout>
  );
}