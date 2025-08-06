// Redirect from /checkout/ to /checkout
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CheckoutIndex() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/checkout');
  }, [router]);
  
  return null;
}