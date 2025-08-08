"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Fade,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

// Types
interface FormData {
  firstname: string;
  lastname: string;
  age: string;
  phone: string;
  mail: string;
  role: string;
}

interface StudentData {
  firstname: string;
  lastname: string;
  age: number;
  phone: string;
  mail: string;
  role: string;
}

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (data: StudentData) => Promise<void>;
}

export default function AddStudentModal({ isOpen, onClose, onAddStudent }: AddStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstname: '',
      lastname: '',
      age: '',
      phone: '',
      mail: '',
      role: '',
    },
  });

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const processedData = {
        ...data,
        age: parseInt(data.age) || 0,
      };
      await onAddStudent(processedData);
      reset();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 400 }}
      aria-labelledby="add-student-modal-title"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          bgcolor: isDarkMode ? 'grey.800' : 'background.paper',
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <DialogTitle
        id="add-student-modal-title"
        sx={{
          bgcolor: isDarkMode ? 'grey.900' : 'grey.100',
          color: isDarkMode ? 'grey.200' : 'text.primary',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${isDarkMode ? 'grey.700' : 'grey.200'}`,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Add New Student
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="Close modal"
          sx={{ color: isDarkMode ? 'grey.400' : 'grey.600', '&:hover': { color: isDarkMode ? 'grey.200' : 'grey.800' } }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 2, pb: 1 }}>
        <form onSubmit={handleSubmit(onSubmit)} aria-live="polite">
          {( ['firstname', 'lastname', 'age', 'phone', 'mail', 'role'] as (keyof FormData)[] ).map((field) => (
            <Box key={field} sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: isDarkMode ? 'grey.400' : 'grey.600', fontWeight: 500, mb: 1, textTransform: 'capitalize' }}
              >
                {field === 'mail' ? 'Email' : field}
              </Typography>
              <TextField
                fullWidth
                type={field === 'age' ? 'number' : field === 'mail' ? 'email' : 'text'}
                {...register(field, {
                  required: `${field === 'mail' ? 'Email' : field.charAt(0).toUpperCase() + field.slice(1)} is required`,
                  ...(field === 'mail' && {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format',
                    },
                  }),
                  ...(field === 'phone' && {
                    pattern: {
                      value: /^[0-9\s\-()]{7,15}$/,
                      message: 'Phone must be 7–15 digits',
                    },
                  }),
                  ...(field === 'age' && {
                    min: {
                      value: 1,
                      message: 'Age must be greater than 0',
                    },
                  }),
                })}
                error={!!errors[field]}
                helperText={errors[field]?.message}
                placeholder={`Enter ${field === 'mail' ? 'email' : field === 'phone' ? 'phone number (e.g., 123-456-7890)' : field}`}
                InputProps={{
                  sx: {
                    bgcolor: isDarkMode ? 'grey.900' : 'grey.50',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? 'grey.700' : 'grey.300',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? 'grey.600' : 'grey.400',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
                sx={{
                  '& .MuiInputLabel-root': { color: isDarkMode ? 'grey.400' : 'grey.600' },
                  '& .MuiInputBase-input': { color: isDarkMode ? 'grey.200' : 'text.primary' },
                }}
                aria-invalid={!!errors[field]}
                aria-describedby={errors[field] ? `${field}-error` : undefined}
                disabled={isLoading}
              />
            </Box>
          ))}
          <DialogActions sx={{ p: 0, pt: 2 }}>
            <Button
              onClick={() => {
                reset();
                onClose();
              }}
              variant="outlined"
              color="inherit"
              disabled={isLoading}
              sx={{ borderRadius: 1, px: 2, py: 0.75, color: isDarkMode ? 'grey.400' : 'grey.600' }}
              aria-label="Cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                borderRadius: 1,
                px: 2.5,
                py: 0.75,
                bgcolor: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.dark },
                '&:disabled': { opacity: 0.6 },
              }}
              aria-label="Add student"
            >
              {isLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : 'Add Student'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
