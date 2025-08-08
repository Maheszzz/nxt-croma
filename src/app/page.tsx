"use client"
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import routing components
import Login from '../components/Login';
import SignUp from '../components/SignUp';
import MainScreen from '../components/MainScreen';
import { MenuProvider } from '../components/MenuContext';

// Placeholder page components (create these in separate files, e.g., HomePage.jsx)
function HomePage() { return <div>Welcome to Home!</div>; }
function AboutPage() { return <div>About Us Page</div>; }
function FinancePage() { return <div>Finance Dashboard</div>; }
function TravelPage() { return <div>Travel Section</div>; }
function AcademicPage() { return <div>Academic Tools</div>; }

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [user, setUser] = useState({ name: '', email: '', lastLogin: '' });

  useEffect(() => {
    try {
      const storedStatus = sessionStorage.getItem('isLoggedIn');
      if (storedStatus === 'true') {
        const storedEmail = sessionStorage.getItem('userEmail') || '';
        const storedName = sessionStorage.getItem('userName') || '';
        const storedLastLogin = sessionStorage.getItem('lastLogin') || new Date().toISOString();

        // Basic validation for email format
        if (storedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storedEmail)) {
          console.warn('Invalid email format in sessionStorage, resetting login');
          clearSession();
          return;
        }

        setUser({ name: storedName, email: storedEmail, lastLogin: storedLastLogin });
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error accessing sessionStorage:', error);
      clearSession();
    }
  }, []);

  const clearSession = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('lastLogin');
    setIsLoggedIn(false);
    setUser({ name: '', email: '', lastLogin: '' });
  };

  const handleLogout = () => {
    try {
      clearSession();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleLogin = (email, name) => {
    try {
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userEmail', email);
      sessionStorage.setItem('userName', name || email.split('@')[0] || 'Guest');
      sessionStorage.setItem('lastLogin', new Date().toISOString());
      setUser({ name: name || email.split('@')[0] || 'Guest', email, lastLogin: new Date().toISOString() });
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleSignup = (email, name) => {
    try {
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userEmail', email);
      sessionStorage.setItem('userName', name || email.split('@')[0] || 'Guest');
      sessionStorage.setItem('lastLogin', new Date().toISOString());
      setUser({ name: name || email.split('@')[0] || 'Guest', email, lastLogin: new Date().toISOString() });
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  // If not logged in, show Login or SignUp
  if (!isLoggedIn) {
    return isLoginPage ? (
      <Login
        onLogin={(email, name) => handleLogin(email, name)}
        onSwitchToSignup={() => setIsLoginPage(false)}
      />
    ) : (
      <SignUp
        onSignup={(email, name) => handleSignup(email, name)}
        onSwitchToLogin={() => setIsLoginPage(true)}
      />
    );
  }

  // If logged in, render routed MainScreen
  return (
    <MenuProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainScreen onLogout={handleLogout} user={user}><HomePage /></MainScreen>} />
          <Route path="/about" element={<MainScreen onLogout={handleLogout} user={user}><AboutPage /></MainScreen>} />
          <Route path="/finance" element={<MainScreen onLogout={handleLogout} user={user}><FinancePage /></MainScreen>} />
          <Route path="/travel" element={<MainScreen onLogout={handleLogout} user={user}><TravelPage /></MainScreen>} />
          <Route path="/academic" element={<MainScreen onLogout={handleLogout} user={user}><AcademicPage /></MainScreen>} />
          {/* Catch-all for unknown routes */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center h-screen text-gray-700">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-lg">Page Not Found</p>
              </div>
            }
          />

        </Routes>
      </BrowserRouter>
    </MenuProvider>
  );
}
