"use client"
import React from 'react';
import Login from '../../../components/Login';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (email: string, name?: string) => {
    // Store login state
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userName', name || email.split('@')[0] || 'Guest');
    sessionStorage.setItem('lastLogin', new Date().toISOString());
    
    // Redirect to home after successful login
    router.push('/home');
  };

  const handleSwitchToSignup = () => {
    router.push('/signup');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0eafc, #cfdef3, #e0e7ff)'
    }}>
      <Login 
        onLogin={handleLogin}
        onSwitchToSignup={handleSwitchToSignup}
      />
    </div>
  );
}
