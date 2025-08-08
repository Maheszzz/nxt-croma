"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// --- Types ---
interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignUpProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

// Styled component for the gradient background
const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #e0eafc, #cfdef3, #e0e7ff)',
  padding: theme.spacing(2, 4),
}));

// Styled component for the card
const SignUpCard = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '480px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: Number(theme.shape.borderRadius) * 2,
  boxShadow: theme.shadows[10],
  padding: theme.spacing(4),
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

export default function SignUp({ onSignup, onSwitchToLogin }: SignUpProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signUpSchema = yup.object().shape({
    firstName: yup.string().required('First name is required').min(2, 'Minimum 2 characters'),
    lastName: yup.string().required('Last name is required').min(2, 'Minimum 2 characters'),
    email: yup.string().required('Email is required').email('Please enter a valid email address'),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters long')
      .matches(/[A-Z]/, 'Must include an uppercase letter')
      .matches(/[a-z]/, 'Must include a lowercase letter')
      .matches(/[0-9]/, 'Must include a number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must include a special character'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords do not match')
      .required('Please confirm your password'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { score: 0, text: 'Too short', color: 'error.main', bgColor: 'error.main' };
    if (password.length < 8) return { score: 1, text: 'Weak', color: 'warning.main', bgColor: 'warning.main' };

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (score < 2) return { score: 1, text: 'Weak', color: 'warning.main', bgColor: 'warning.main' };
    if (score < 4) return { score: 2, text: 'Medium', color: 'warning.main', bgColor: 'warning.main' };
    return { score: 3, text: 'Strong', color: 'success.main', bgColor: 'success.main' };
  };

  const handleSignup = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (data.email && data.password) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('userName', `${data.firstName} ${data.lastName}`);
        onSignup();
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <GradientBackground>
      <SignUpCard>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Create Account
        </Typography>
        <Typography align="center" sx={{ color: 'text.secondary', mb: 4 }}>
          Join us and get started today
        </Typography>

        <form onSubmit={handleSubmit(handleSignup)}>
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                id="firstName"
                label="First Name"
                variant="outlined"
                disabled={isLoading}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                {...register('firstName')}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ color: 'action.active', mr: 1, display: 'flex', alignItems: 'center' }}>
                      <User />
                    </Box>
                  ),
                }}
              />
              <TextField
                fullWidth
                id="lastName"
                label="Last Name"
                variant="outlined"
                disabled={isLoading}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                {...register('lastName')}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ color: 'action.active', mr: 1, display: 'flex', alignItems: 'center' }}>
                      <User />
                    </Box>
                  ),
                }}
              />
            </Box>

            <TextField
              fullWidth
              id="email"
              label="Email Address"
              variant="outlined"
              disabled={isLoading}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: 'action.active', mr: 1, display: 'flex', alignItems: 'center' }}>
                    <Mail />
                  </Box>
                ),
              }}
            />

            <TextField
              fullWidth
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              disabled={isLoading}
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password')}
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: 'action.active', mr: 1, display: 'flex', alignItems: 'center' }}>
                    <Lock />
                  </Box>
                ),
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: 'auto', p: 0 }}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                ),
              }}
            />
            {password && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Password strength:{' '}
                  <Typography
                    component="span"
                    sx={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.text}
                  </Typography>
                </Typography>
                <Box sx={{ height: 6, backgroundColor: 'grey.200', borderRadius: 1, mt: 0.5 }}>
                  <Box
                    sx={{
                      height: '100%',
                      borderRadius: 1,
                      width: `${(passwordStrength.score + 1) * 33.33}%`,
                      backgroundColor: passwordStrength.bgColor,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              id="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              disabled={isLoading}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword')}
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: 'action.active', mr: 1, display: 'flex', alignItems: 'center' }}>
                    <Lock />
                  </Box>
                ),
                endAdornment: (
                  <Button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    sx={{ minWidth: 'auto', p: 0 }}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </Button>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !isValid}
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
              <Stack direction="row" alignItems="center" spacing={1}>
                {isLoading && <CircularProgress size={20} sx={{ color: 'white' }} />}
                <Typography>{isLoading ? 'Creating Account...' : 'Create Account'}</Typography>
              </Stack>
            </Button>
          </Stack>
        </form>

        <Typography align="center" sx={{ mt: 2, color: 'text.secondary' }}>
          Already have an account?{' '}
          <Button
            onClick={onSwitchToLogin}
            disabled={isLoading}
            sx={{ color: 'primary.main', textTransform: 'none', '&:hover': { color: 'primary.dark' } }}
          >
            Sign in here
          </Button>
        </Typography>

        <Typography align="center" sx={{ mt: 2, color: 'text.disabled', fontSize: '0.75rem' }}>
          Demo: Fill in all fields with valid data to create account
        </Typography>
      </SignUpCard>
    </GradientBackground>
  );
}