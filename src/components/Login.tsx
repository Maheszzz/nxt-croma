"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled background
const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #e0eafc, #cfdef3, #e0e7ff)',
  padding: theme.spacing(2, 4),
}));

// Styled login card
const LoginCard = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[10],
  padding: theme.spacing(4),
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

export default function Login({ onLogin, onSwitchToSignup }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setGeneralError('');

    console.log('Form Data:', { username: data.username, password: data.password });

    try {
      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // ✅ Next.js way to access env variables
      const correctUsername =
        process.env.NEXT_PUBLIC_CORRECT_USERNAME || 'testuser@example.com';
      const correctPassword =
        process.env.NEXT_PUBLIC_CORRECT_PASSWORD || 'password123';

      console.log('Env Variables:', { correctUsername, correctPassword });

      if (!correctUsername || !correctPassword) {
        throw new Error('Environment variables not loaded correctly');
      }

      // Trim input to avoid whitespace issues
      const trimmedUsername = data.username.trim();
      const trimmedPassword = data.password.trim();

      const isValid =
        trimmedUsername === correctUsername &&
        trimmedPassword === correctPassword;

      console.log('Validation Result:', {
        isValid,
        trimmedUsername,
        trimmedPassword,
      });

      if (isValid) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', trimmedUsername);
        sessionStorage.setItem(
          'userName',
          trimmedUsername.split('@')[0] || trimmedUsername
        );
        sessionStorage.setItem('lastLogin', new Date().toISOString());

        reset();
        onLogin(trimmedUsername, trimmedUsername.split('@')[0] || trimmedUsername);
      } else {
        setError('username', { message: 'Invalid username or password' });
        setError('password', { message: ' ' });
      }
    } catch (error) {
      console.error('Login Error:', error.message);
      setGeneralError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <LoginCard>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'text.primary' }}
        >
          Welcome Back
        </Typography>

        {generalError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {generalError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Username Field */}
            <TextField
              fullWidth
              id="username"
              label="Username (Email)"
              variant="outlined"
              disabled={isLoading}
              error={!!errors.username}
              helperText={errors.username?.message}
              {...register('username', {
                required: 'Username is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              InputProps={{
                startAdornment: <Mail sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              id="password"
              label="Password"
              type="password"
              variant="outlined"
              disabled={isLoading}
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters long',
                },
              })}
              InputProps={{
                startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 2,
                py: 1.5,
                background: 'linear-gradient(90deg, #4b5bf7, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #364fc7, #7c3aed)',
                },
                '&:disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                },
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />{' '}
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </Stack>
        </form>

        {/* Switch to Sign Up */}
        <Typography align="center" sx={{ mt: 2, color: 'text.secondary' }}>
          Don't have an account?{' '}
          <Button
            onClick={onSwitchToSignup}
            disabled={isLoading}
            sx={{
              color: 'primary.main',
              textTransform: 'none',
              '&:hover': { color: 'primary.dark' },
            }}
          >
            Create one here
          </Button>
        </Typography>

        {/* Demo credentials (remove in production) */}
        <Typography
          align="center"
          sx={{ mt: 2, color: 'text.disabled', fontSize: '0.75rem' }}
        >
          Demo Login → Username: <b>testuser@example.com</b>, Password:{' '}
          <b>password123</b>
        </Typography>
      </LoginCard>
    </GradientBackground>
  );
}
