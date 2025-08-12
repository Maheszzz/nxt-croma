"use client"
import React from 'react';
import SignUp from '../../../components/SignUp';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = (email: string, name?: string) => {
    // Store signup state (auto-login after signup)
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userName', name || email.split('@')[0] || 'Guest');
    sessionStorage.setItem('lastLogin', new Date().toISOString());
    
    // Redirect to home after successful signup
    router.push('/home');
  };

  const handleSwitchToLogin = () => {
    router.push('/login');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0eafc, #cfdef3, #e0e7ff)'
    }}>
      <SignUp 
        onSignup={handleSignup}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}
