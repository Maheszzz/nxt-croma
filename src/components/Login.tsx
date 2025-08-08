"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  Fade,
  IconButton,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { styled } from '@mui/material/styles';

interface LoginProps {
  onLogin: (email: string, name: string) => void;
  onSwitchToSignup: () => void;
  toggleTheme?: () => void; // Optional callback to toggle theme in parent
}

interface LoginFormInputs {
  username: string;
  password: string;
}

// Styled components with enhanced responsiveness
const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)'
    : 'linear-gradient(135deg, #e0eafc, #cfdef3, #e0e7ff)',
  transition: theme.transitions.create('background', {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
}));

const LoginCard = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '500px', // Responsive scaling handled by sx or parent
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[12],
  padding: theme.spacing(3, 4),
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
    easing: theme.transitions.easing.easeInOut,
  }),
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[16],
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%',
    padding: theme.spacing(2),
  },
}));

const isBrowser = typeof window !== 'undefined';

const setSession = (key: string, value: string): void => {
  if (isBrowser) sessionStorage.setItem(key, value);
};

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, toggleTheme }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setFocus,
  } = useForm<LoginFormInputs>({
    mode: 'onBlur',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>('');
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const errorRegionRef = useRef<HTMLDivElement>(null);

  // Focus on username field on mount
  useEffect(() => {
    setFocus('username');
  }, [setFocus]);

  // Announce errors to screen readers
  useEffect(() => {
    if (generalError || errors.username || errors.password) {
      errorRegionRef.current?.focus();
    }
  }, [generalError, errors.username, errors.password]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    setGeneralError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const correctUsername = process.env.NEXT_PUBLIC_CORRECT_USERNAME || 'testuser@example.com';
      const correctPassword = process.env.NEXT_PUBLIC_CORRECT_PASSWORD || 'password123';

      if (!correctUsername || !correctPassword) {
        throw new Error('Authentication configuration is missing');
      }

      const trimmedUsername = data.username.trim();
      const trimmedPassword = data.password.trim();

      if (trimmedUsername === correctUsername && trimmedPassword === correctPassword) {
        setSession('isLoggedIn', 'true');
        setSession('userEmail', trimmedUsername);
        setSession('userName', trimmedUsername.split('@')[0] || trimmedUsername);
        setSession('lastLogin', new Date().toISOString());

        clearErrors();
        onLogin(trimmedUsername, trimmedUsername.split('@')[0] || trimmedUsername);
      } else {
        if (trimmedUsername !== correctUsername) {
          setError('username', { type: 'manual', message: 'Invalid email address' });
        }
        if (trimmedPassword !== correctPassword) {
          setError('password', { type: 'manual', message: 'Invalid password' });
        }
      }
    } catch (error: unknown) {
      setGeneralError(
        error instanceof Error ? error.message : 'An error occurred during login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <Fade in={true} timeout={600}>
        <LoginCard role="form" aria-label="Login Form">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              align="center"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                flexGrow: 1,
              }}
            >
              Welcome Back
            </Typography>
            {toggleTheme && (
              <IconButton
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                sx={{ color: isDarkMode ? '#90caf9' : 'text.secondary' }}
              >
                {isDarkMode ? (
                  <Brightness7Icon sx={{ fontSize: 24 }} />
                ) : (
                  <Brightness4Icon sx={{ fontSize: 24 }} />
                )}
              </IconButton>
            )}
          </Box>

          <Box
            ref={errorRegionRef}
            sx={{ outline: 'none' }}
            tabIndex={-1}
            aria-live="polite"
            aria-atomic="true"
          >
            {generalError && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 1, bgcolor: isDarkMode ? '#421f1f' : '#ffebee' }}
                role="alert"
              >
                {generalError}
              </Alert>
            )}
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              <TextField
                fullWidth
                id="username"
                label="Email"
                variant="outlined"
                disabled={isLoading}
                error={!!errors.username}
                helperText={errors.username?.message}
                {...register('username', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
                InputProps={{
                  startAdornment: (
                    <Mail
                      style={{ color: theme.palette.text.secondary, marginRight: theme.spacing(1) }}
                      size={20}
                    />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: theme.palette.background.paper,
                    '& fieldset': { borderColor: theme.palette.divider },
                    '&:hover fieldset': { borderColor: theme.palette.text.secondary },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                  '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.error.main,
                  },
                }}
                inputProps={{
                  'aria-required': 'true',
                  'aria-describedby': errors.username ? 'username-error' : undefined,
                }}
              />

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
                    message: 'Password must be at least 6 characters',
                  },
                })}
                InputProps={{
                  startAdornment: (
                    <Lock
                      style={{ color: theme.palette.text.secondary, marginRight: theme.spacing(1) }}
                      size={20}
                    />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: theme.palette.background.paper,
                    '& fieldset': { borderColor: theme.palette.divider },
                    '&:hover fieldset': { borderColor: theme.palette.text.secondary },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                  '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.error.main,
                  },
                }}
                inputProps={{
                  'aria-required': 'true',
                  'aria-describedby': errors.password ? 'password-error' : undefined,
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  '&:hover': {
                    background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed',
                    background: theme.palette.action.disabledBackground,
                  },
                  transition: theme.transitions.create('background', {
                    duration: theme.transitions.duration.short,
                  }),
                }}
                aria-label="Sign in"
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress
                      size={24}
                      sx={{ color: theme.palette.common.white, mr: 1 }}
                      aria-label="Loading"
                    />
                    Signing In...
                  </Box>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
          </Box>

          <Typography
            align="center"
            sx={{ mt: 3, color: theme.palette.text.secondary, fontSize: '0.875rem' }}
          >
            Don&apos;t have an account?{' '}
            <Button
              onClick={onSwitchToSignup}
              disabled={isLoading}
              sx={{
                color: theme.palette.primary.main,
                textTransform: 'none',
                '&:hover': { color: theme.palette.primary.dark },
              }}
              aria-label="Switch to signup"
            >
              Create one here
            </Button>
          </Typography>

          <Typography
            align="center"
            sx={{ mt: 2, color: theme.palette.text.disabled, fontSize: '0.75rem' }}
          >
            Demo Login → Username: <b>testuser@example.com</b>, Password: <b>password123</b>
          </Typography>
        </LoginCard>
      </Fade>
    </GradientBackground>
  );
};

export default Login;