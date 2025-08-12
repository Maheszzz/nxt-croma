"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock } from "lucide-react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface LoginFormInputs {
  username: string;
  password: string;
}

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #e0eafc, #cfdef3, #e0e7ff)",
  padding: theme.spacing(2, 4),
}));

const LoginCard = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: "400px",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  borderRadius: (theme.shape.borderRadius as number) * 2,
  boxShadow: theme.shadows[10],
  padding: theme.spacing(4),
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.02)",
  },
}));

interface LoginProps {
  onLogin: (email: string, name?: string) => void;
  onSwitchToSignup: () => void;
}

export default function Login({ onLogin, onSwitchToSignup }: LoginProps) {

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<LoginFormInputs>({
    mode: "onBlur",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setGeneralError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const correctUsername =
        process.env.NEXT_PUBLIC_CORRECT_USERNAME || "testuser@example.com";
      const correctPassword =
        process.env.NEXT_PUBLIC_CORRECT_PASSWORD || "password123";

      if (!correctUsername || !correctPassword) {
        throw new Error("Environment variables not loaded correctly");
      }

      const trimmedUsername = data.username.trim();
      const trimmedPassword = data.password.trim();

      const isValid =
        trimmedUsername === correctUsername &&
        trimmedPassword === correctPassword;

      if (isValid) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userEmail", trimmedUsername);
        sessionStorage.setItem(
          "userName",
          trimmedUsername.split("@")[0] || trimmedUsername
        );
        sessionStorage.setItem("lastLogin", new Date().toISOString());

        reset();
        onLogin(trimmedUsername, trimmedUsername.split("@")[0] || trimmedUsername);
      } else {
        setError("username", { message: "Invalid username or password" });
        setError("password", { message: " " });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setGeneralError(errorMessage);
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
          sx={{ fontWeight: "bold", color: "text.primary" }}
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
            <TextField
              fullWidth
              id="username"
              label="Username (Email)"
              variant="outlined"
              disabled={isLoading}
              error={!!errors.username}
              helperText={errors.username?.message}
              {...register("username", {
                required: "Username is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
              InputProps={{
                startAdornment: <Mail style={{ color: "gray", marginRight: 8 }} />,
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
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
              InputProps={{
                startAdornment: <Lock style={{ color: "gray", marginRight: 8 }} />,
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
                background: "linear-gradient(90deg, #4b5bf7, #8b5cf6)",
                "&:hover": {
                  background: "linear-gradient(90deg, #364fc7, #7c3aed)",
                },
                "&:disabled": {
                  opacity: 0.5,
                  cursor: "not-allowed",
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </Stack>
        </form>

        <Typography align="center" sx={{ mt: 2, color: "text.secondary" }}>
          Don&apos;t have an account?{" "}
          <Button
            onClick={onSwitchToSignup}
            disabled={isLoading}
            sx={{
              color: "primary.main",
              textTransform: "none",
              "&:hover": { color: "primary.dark" },
            }}
          >
            Create one here
          </Button>
        </Typography>

        <Typography
          align="center"
          sx={{ mt: 2, color: "text.disabled", fontSize: "0.75rem" }}
        >
          Demo Login → Username: <b>testuser@example.com</b>, Password: <b>password123</b>
        </Typography>
      </LoginCard>
    </GradientBackground>
  );
}
