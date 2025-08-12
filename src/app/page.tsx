"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
      // If logged in, redirect to home
      router.push('/home');
    } else {
      // If not logged in, redirect to login
      router.push('/login');
    }
  }, [router]);

  return null;
}
