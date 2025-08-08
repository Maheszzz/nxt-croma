"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
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
  Tooltip,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { styled } from '@mui/material/styles';

interface SignUpProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
  toggleTheme?: () => void;
}

interface SignUpFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Styled components
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

const SignUpCard = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '90%',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(12px)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[12],
  padding: theme.spacing(4),
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
    easing: theme.transitions.easing.easeInOut,
  }),
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[16],
  },
  [theme.breakpoints.up('sm')]: {
    maxWidth: '400px',
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: '450px',
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: '500px',
  },
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(3),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  py: 1.5,
  minHeight: 48,
  fontSize: '1rem',
  fontWeight: 600,
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  '&:hover': {
    background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: 'translateY(-2px)',
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    background: theme.palette.action.disabledBackground,
  },
  transition: theme.transitions.create(['background', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
}));

const isBrowser = typeof window !== 'undefined';

const setSession = (key: string, value: string): void => {
  if (isBrowser) {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set session storage:', error);
    }
  }
};

const signUpSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'Minimum 2 characters'),
  lastName: yup.string().required('Last name is required').min(1, 'Minimum 1 character'),
  email: yup.string().required('Email is required').email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Must include an uppercase letter')
    .matches(/[a-z]/, 'Must include a lowercase letter')
    .matches(/[0-9]/, 'Must include a number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must include a special character'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

const SignUp: React.FC<SignUpProps> = ({ onSignup, onSwitchToLogin, toggleTheme }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [generalError, setGeneralError] = React.useState<string>('');
  const [successMessage, setSuccessMessage] = React.useState<string>('');
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
  const errorRegionRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors},
    watch,
    setFocus,
    reset,
  } = useForm<SignUpFormInputs>({
    resolver: yupResolver(signUpSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  const passwordStrength = useMemo(() => {
    if (!password) {
      return { score: 0, text: '', color: 'transparent', bgColor: 'transparent' };
    }
    if (password.length < 6) {
      return { score: 0, text: 'Too short', color: theme.palette.error.main, bgColor: theme.palette.error.light };
    }
    if (password.length < 8) {
      return { score: 1, text: 'Weak', color: theme.palette.warning.main, bgColor: theme.palette.warning.light };
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (score < 2) {
      return { score: 1, text: 'Weak', color: theme.palette.warning.main, bgColor: theme.palette.warning.light };
    }
    if (score < 4) {
      return { score: 2, text: 'Medium', color: theme.palette.warning.main, bgColor: theme.palette.warning.light };
    }
    return { score: 3, text: 'Strong', color: theme.palette.success.main, bgColor: theme.palette.success.light };
  }, [password, theme.palette]);

  useEffect(() => {
    setFocus('firstName');
  }, [setFocus]);

  useEffect(() => {
    if (generalError || Object.keys(errors).length > 0) {
      errorRegionRef.current?.focus();
    }
  }, [generalError, errors]);

  const handleSignup: SubmitHandler<SignUpFormInputs> = async (data) => {
    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (data.email && data.password && data.firstName && data.lastName) {
        const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
        setSession('isLoggedIn', 'true');
        setSession('userEmail', data.email.trim());
        setSession('userName', fullName);
        setSession('lastLogin', new Date().toISOString());
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          reset();
          onSignup();
        }, 1000);
      } else {
        throw new Error('Please fill in all required fields');
      }
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'An error occurred during signup. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <GradientBackground>
      <Fade in={true} timeout={600}>
        <SignUpCard role="form" aria-label="Sign Up Form">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              align="center"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                flexGrow: 1,
                letterSpacing: '-0.5px',
              }}
            >
              Create Account
            </Typography>
            {toggleTheme && (
              <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
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
              </Tooltip>
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
                id="general-error"
              >
                {generalError}
              </Alert>
            )}
            {successMessage && (
              <Alert
                severity="success"
                sx={{ mb: 3, borderRadius: 1, bgcolor: isDarkMode ? '#1b3e1f' : '#e8f5e9' }}
                role="alert"
                id="success-message"
              >
                {successMessage}
              </Alert>
            )}
          </Box>

          <Box component="form" onSubmit={handleSubmit(handleSignup)} noValidate>
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
                      <User
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
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                    '& .MuiFormHelperText-root': { color: theme.palette.error.main, mt: 1 },
                  }}
                  inputProps={{
                    'aria-required': 'true',
                    'aria-describedby': errors.firstName ? 'firstName-error' : undefined,
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
                      <User
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
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                    '& .MuiFormHelperText-root': { color: theme.palette.error.main, mt: 1 },
                  }}
                  inputProps={{
                    'aria-required': 'true',
                    'aria-describedby': errors.lastName ? 'lastName-error' : undefined,
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
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  },
                  '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                  '& .MuiFormHelperText-root': { color: theme.palette.error.main, mt: 1 },
                }}
                inputProps={{
                  'aria-required': 'true',
                  'aria-describedby': errors.email ? 'email-error' : undefined,
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
                helperText={
                  errors.password?.message || (
                    <Tooltip
                      title="Password must be at least 6 characters, include uppercase, lowercase, number, and special character"
                      placement="top"
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary, cursor: 'help' }}
                      >
                        Password requirements
                      </Typography>
                    </Tooltip>
                  )
                }
                {...register('password')}
                InputProps={{
                  startAdornment: (
                    <Lock
                      style={{ color: theme.palette.text.secondary, marginRight: theme.spacing(1) }}
                      size={20}
                    />
                  ),
                  endAdornment: (
                    <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </Tooltip>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: theme.palette.background.paper,
                    '& fieldset': { borderColor: theme.palette.divider },
                    '&:hover fieldset': { borderColor: theme.palette.text.secondary },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  },
                  '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                  '& .MuiFormHelperText-root': { mt: 1 },
                }}
                inputProps={{
                  'aria-required': 'true',
                  'aria-describedby': errors.password ? 'password-error' : 'password-help',
                }}
              />

              {password && (
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Typography
                    id="password-strength"
                    variant="body2"
                    color={theme.palette.text.secondary}
                    sx={{ fontWeight: 500 }}
                  >
                    Password strength:{' '}
                    <Typography
                      component="span"
                      sx={{
                        color: passwordStrength.color,
                        fontWeight: 600,
                        display: 'inline',
                      }}
                    >
                      {passwordStrength.text}
                    </Typography>
                  </Typography>
                  <Box
                    sx={{
                      height: 8,
                      backgroundColor: theme.palette.divider,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        width: `${Math.min((passwordStrength.score + 1) * 33.33, 100)}%`,
                        backgroundColor: passwordStrength.bgColor,
                        transition: theme.transitions.create('width', {
                          duration: theme.transitions.duration.standard,
                          easing: theme.transitions.easing.easeInOut,
                        }),
                      }}
                    />
                  </Box>
                </Stack>
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
                    <Lock
                      style={{ color: theme.palette.text.secondary, marginRight: theme.spacing(1) }}
                      size={20}
                    />
                  ),
                  endAdornment: (
                    <Tooltip title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </Tooltip>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: theme.palette.background.paper,
                    '& fieldset': { borderColor: theme.palette.divider },
                    '&:hover fieldset': { borderColor: theme.palette.text.secondary },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  },
                  '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                  '& .MuiFormHelperText-root': { color: theme.palette.error.main, mt: 1 },
                }}
                inputProps={{
                  'aria-required': 'true',
                  'aria-describedby': errors.confirmPassword ? 'confirmPassword-error' : undefined,
                }}
              />

              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                aria-label="Create account"
                sx={{ mt: 3 }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress
                      size={20}
                      sx={{ color: theme.palette.common.white, mr: 1 }}
                      aria-label="Loading"
                    />
                    Creating Account...
                  </Box>
                ) : (
                  'Create Account'
                )}
              </StyledButton>
            </Stack>
          </Box>

          <Typography
            align="center"
            sx={{ mt: 3, color: theme.palette.text.secondary, fontSize: '0.875rem' }}
          >
            Already have an account?{' '}
            <Button
              onClick={onSwitchToLogin}
              disabled={isLoading}
              sx={{
                color: theme.palette.primary.main,
                textTransform: 'none',
                '&:hover': { color: theme.palette.primary.dark },
              }}
              aria-label="Switch to login"
            >
              Sign in here
            </Button>
          </Typography>

          <Typography
            align="center"
            sx={{ mt: 2, color: theme.palette.text.disabled, fontSize: '0.75rem' }}
          >
            Demo: Fill in all fields with valid data to create account
          </Typography>
        </SignUpCard>
      </Fade>
    </GradientBackground>
  );
};

export default SignUp;