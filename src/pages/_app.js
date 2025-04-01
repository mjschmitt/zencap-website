// src/pages/_app.js - With route-based transition customization
import "@/styles/globals.css";
import { AnimatePresence } from 'framer-motion';
import { Inter, Playfair_Display } from 'next/font/google';
import PageTransition from '@/components/PageTransitions';

// Load fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export default function App({ Component, pageProps, router }) {
  // Define different transitions for different sections
  let variant = 'default';
  let transitionPreset = 'default';
  
  // Customize transitions based on route
  if (router.pathname.startsWith('/products')) {
    variant = 'slideLeft';
    transitionPreset = 'spring';
  } else if (router.pathname.startsWith('/services')) {
    variant = 'slideUp';
    transitionPreset = 'smooth';
  } else if (router.pathname === '/contact') {
    variant = 'fade';
    transitionPreset = 'slow';
  } else if (router.pathname === '/about') {
    variant = 'scale';
    transitionPreset = 'smooth';
  }

  return (
    <main className={`${inter.variable} ${playfair.variable}`}>
      <AnimatePresence mode="wait">
        <PageTransition 
          key={router.route} 
          variant={variant}
          transitionPreset={transitionPreset}
        >
          <Component {...pageProps} />
        </PageTransition>
      </AnimatePresence>
    </main>
  );
}