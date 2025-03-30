// src/pages/_app.js
import "@/styles/globals.css";
import { AnimatePresence } from 'framer-motion';
import { Inter, Playfair_Display } from 'next/font/google';

// Load Inter for general text
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Load Playfair Display for headings
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export default function App({ Component, pageProps, router }) {
  return (
    <main className={`${inter.variable} ${playfair.variable}`}>
      <AnimatePresence mode="wait">
        <Component {...pageProps} key={router.route} />
      </AnimatePresence>
    </main>
  );
}