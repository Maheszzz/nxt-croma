"use client"
import React, { useEffect, useState } from 'react';
import MainScreen from '../../components/MainScreen';
import { MenuProvider } from '../../components/MenuContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [user, setUser] = useState({ name: '', email: '', lastLogin: '' });
  const router = useRouter();

  useEffect(() => {
    // Ensure user is logged in when accessing home
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      // If not logged in, redirect to login
      router.push('/login');
      return;
    }

    // Load user data
    const storedEmail = sessionStorage.getItem('userEmail') || '';
    const storedName = sessionStorage.getItem('userName') || '';
    const storedLastLogin = sessionStorage.getItem('lastLogin') || new Date().toISOString();

    setUser({ name: storedName, email: storedEmail, lastLogin: storedLastLogin });
  }, [router]);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('lastLogin');
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <MenuProvider>
      <MainScreen onLogout={handleLogout} user={user}>
        <div>Welcome to the Dashboard</div>
      </MainScreen>
    </MenuProvider>
  );
}
