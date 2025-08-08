"use client";
import React from 'react';
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
} from '@mui/material';

type AddStudentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (data: any) => void;
};

export default function AddStudentModal({ isOpen, onClose, onAddStudent }: AddStudentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const onSubmit = (data: any) => {
    onAddStudent({
      ...data,
      date: new Date('04:35 PM IST, Thursday, August 07, 2025').toISOString(),
      age: parseInt(data.age) || 0,
    });
    reset();
    onClose();
  };

  if (!isOpen) return null;

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
          bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <DialogTitle
        id="add-student-modal-title"
        sx={{
          bgcolor: isDarkMode ? '#333' : '#f5f5f5',
          color: isDarkMode ? '#e0e0e0' : '#1e1e1e',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Add New Student
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="Close modal"
          sx={{ color: isDarkMode ? '#bbb' : '#666', '&:hover': { color: isDarkMode ? '#fff' : '#000' } }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {['firstname', 'lastname', 'age', 'phone', 'mail', 'role'].map((field) => (
            <div key={field}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ color: isDarkMode ? '#bbb' : '#666', fontWeight: 500, mb: 1, textTransform: 'capitalize' }}
              >
                {field === 'mail' ? 'Email' : field}
              </Typography>
              <TextField
                fullWidth
                type={field === 'age' ? 'number' : field === 'mail' ? 'email' : 'text'}
                {...register(field, {
                  required: `${field === 'mail' ? 'Email' : field} is required`,
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
                    bgcolor: isDarkMode ? '#2c2c2c' : 'rgba(0,0,0,0.04)',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? '#555' : '#ccc',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? '#777' : '#999',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
                sx={{
                  '& .MuiInputLabel-root': { color: isDarkMode ? '#bbb' : '#666' },
                  '& .MuiInputBase-input': { color: isDarkMode ? '#e0e0e0' : '#1e1e1e' },
                }}
                aria-invalid={!!errors[field]}
                aria-describedby={errors[field] ? `${field}-error` : undefined}
              />
              {errors[field] && (
                <Typography
                  id={`${field}-error`}
                  variant="caption"
                  sx={{ mt: 1, color: 'error.main', display: 'block' }}
                >
                  {errors[field]?.message}
                </Typography>
              )}
            </div>
          ))}

          <DialogActions sx={{ p: 0, pt: 4 }}>
            <Button
              onClick={() => {
                reset();
                onClose();
              }}
              variant="outlined"
              color="inherit"
              disabled={isLoading}
              sx={{ borderRadius: 1, px: 2, py: 0.75, color: isDarkMode ? '#bbb' : '#666' }}
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
                bgcolor: isDarkMode ? '#90caf9' : '#1976d2',
                '&:hover': {
                  bgcolor: isDarkMode ? '#bbdefb' : '#1565c0',
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed',
                },
              }}
            >
              Add Student
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}