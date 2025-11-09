"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, MailCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";

// --------------------------------
// Types and Enums
// --------------------------------

export enum AuthView {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
  FORGOT_PASSWORD = "forgot-password",
  RESET_SUCCESS = "reset-success",
  SIGNUP_SUCCESS = "signup-success",
  UPDATE_PASSWORD = "update-password",
}

interface AuthState {
  view: AuthView;
  email?: string;
}

interface FormState {
  isLoading: boolean;
  error: string | null;
  showPassword: boolean;
}

const DEFAULT_VALIDATION_ERROR = "Please fix the highlighted fields and try again.";

function getErrorMessage(error: unknown) {
  // Handle ZodError specifically
  if (error && typeof error === "object" && "issues" in error) {
    const zodError = error as { issues: Array<{ message: string; path: string[] }> };
    if (Array.isArray(zodError.issues) && zodError.issues.length > 0) {
      // If there are multiple validation errors, show a general message
      if (zodError.issues.length > 1) {
        return "Please fill in all required fields correctly.";
      }
      // Return the first error message from Zod validation
      return zodError.issues[0].message;
    }
  }
  
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error.length > 0) {
    return error;
  }
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  return "An unexpected error occurred";
}

function getFirstFieldError(errors: FieldErrors): string | null {
  for (const value of Object.values(errors)) {
    if (!value) continue;
    if (typeof value === "object" && value !== null) {
      if ("message" in value && typeof value.message === "string" && value.message.length > 0) {
        return value.message;
      }
      if ("types" in value && value.types && typeof value.types === "object") {
        const firstTypeMessage = Object.values(value.types)[0];
        if (typeof firstTypeMessage === "string" && firstTypeMessage.length > 0) {
          return firstTypeMessage;
        }
      }
    }
  }
  return null;
}

// --------------------------------
// Schemas
// --------------------------------

const signInSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character (@$!%*?&)"),
  terms: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms",
  }),
});

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

const updatePasswordSchema = z.object({
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be less than 72 characters"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

// --------------------------------
// Main Auth Component
// --------------------------------

interface AuthProps extends React.ComponentProps<"div"> {
  onSignIn: (values: SignInFormValues) => Promise<void>;
  onSignUp: (values: SignUpFormValues) => Promise<void>;
  onForgotPassword?: (values: ForgotPasswordFormValues) => Promise<void>;
  onUpdatePassword?: (password: string) => Promise<void>;
  onSignInWithGoogle?: () => Promise<void>;
  onResendVerification?: (email: string) => Promise<void>;
  defaultView?: AuthView;
  onSuccess?: () => void;
  onViewChange?: (view: AuthView) => void;
}

function Auth({
  className,
  onSignIn,
  onSignUp,
  onForgotPassword,
  onUpdatePassword,
  onSignInWithGoogle,
  onResendVerification,
  defaultView = AuthView.SIGN_IN,
  onSuccess,
  onViewChange,
  ...props
}: AuthProps) {
  const [state, setState] = React.useState<AuthState>({ view: defaultView });

  const setView = React.useCallback(
    (view: AuthView) => {
      setState((prev) => ({ ...prev, view }));
      onViewChange?.(view);
    },
    [onViewChange],
  );

  return (
    <div data-slot="auth" className={cn("mx-auto w-full max-w-md", className)} {...props}>
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {state.view === AuthView.SIGN_IN && (
              <AuthSignIn
                key="sign-in"
                onSubmit={async (values) => {
                  await onSignIn(values);
                  onSuccess?.();
                }}
                onForgotPassword={() => setView(AuthView.FORGOT_PASSWORD)}
                onSignUp={() => setView(AuthView.SIGN_UP)}
                onGoogleSignIn={onSignInWithGoogle}
              />
            )}
            {state.view === AuthView.SIGN_UP && (
              <AuthSignUp
                key="sign-up"
                onSignIn={() => setView(AuthView.SIGN_IN)}
                onSubmit={async (values) => {
                  await onSignUp(values);
                  setState((prev) => ({ ...prev, email: values.email }));
                  setView(AuthView.SIGNUP_SUCCESS);
                }}
                onGoogleSignIn={onSignInWithGoogle}
              />
            )}
            {state.view === AuthView.FORGOT_PASSWORD && (
              <AuthForgotPassword
                key="forgot-password"
                onSignIn={() => setView(AuthView.SIGN_IN)}
                onSubmit={onForgotPassword}
                onSuccess={() => setView(AuthView.RESET_SUCCESS)}
              />
            )}
            {state.view === AuthView.RESET_SUCCESS && (
              <AuthResetSuccess key="reset-success" onSignIn={() => setView(AuthView.SIGN_IN)} />
            )}
            {state.view === AuthView.UPDATE_PASSWORD && (
              <AuthUpdatePassword
                key="update-password"
                onSubmit={onUpdatePassword}
                onSuccess={() => {
                  onSuccess?.();
                }}
              />
            )}
            {state.view === AuthView.SIGNUP_SUCCESS && (
              <AuthSignupSuccess 
                key="signup-success" 
                onSignIn={() => setView(AuthView.SIGN_IN)} 
                email={state.email}
                onResendVerification={onResendVerification}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --------------------------------
// Shared Components
// --------------------------------

interface AuthFormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
  className?: string;
}

function AuthForm({ onSubmit, children, className }: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} data-slot="auth-form" className={cn("space-y-6", className)}>
      {children}
    </form>
  );
}

interface AuthErrorProps {
  message: string | null;
}

function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      data-slot="auth-error"
      className="mb-6 rounded-xl border border-destructive/30 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent p-4 shadow-sm backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20">
            <AlertCircle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <motion.p 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1.5"
    >
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </motion.p>
  );
}

interface AuthSocialButtonsProps {
  isLoading: boolean;
  onGoogleClick?: () => void;
}

function AuthSocialButtons({ isLoading, onGoogleClick }: AuthSocialButtonsProps) {
  return (
    <div data-slot="auth-social-buttons" className="mt-6 w-full">
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full border-border/50 bg-background/50"
        disabled={isLoading || !onGoogleClick}
        onClick={onGoogleClick}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Google
      </Button>
    </div>
  );
}

interface AuthSeparatorProps {
  text?: string;
}

function AuthSeparator({ text = "Or continue with" }: AuthSeparatorProps) {
  return (
    <div data-slot="auth-separator" className="relative mt-6">
      <div className="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}

// --------------------------------
// Sign In Component
// --------------------------------

interface AuthSignInProps {
  onSubmit: (values: SignInFormValues) => Promise<void>;
  onForgotPassword: () => void;
  onSignUp: () => void;
  onGoogleSignIn?: () => Promise<void>;
}

function AuthSignIn({ onSubmit, onForgotPassword, onSignUp, onGoogleSignIn }: AuthSignInProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const handleFormSubmit = async (data: SignInFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      console.log('🔐 [UI] Sign in form submitted:', { email: data.email });
      // Ensure password is properly handled
      const submitData = {
        ...data,
        email: data.email.trim(),
        password: data.password?.trim() || ""
      };
      await onSubmit(submitData);
      console.log('✅ [UI] Sign in successful');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('🔒 [UI] Sign in handled error:', error);
      }
      const errorMessage = getErrorMessage(error);
      console.log('📢 [UI] Setting error state:', errorMessage);
      setFormState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      return; // Prevent finally from overriding
    }
    setFormState((prev) => ({ ...prev, isLoading: false }));
  };

  const handleFormInvalid = React.useCallback((errors: FieldErrors<SignInFormValues>) => {
    const fieldError = getFirstFieldError(errors);
    setFormState((prev) => ({
      ...prev,
      error: fieldError ?? DEFAULT_VALIDATION_ERROR,
      isLoading: false,
    }));
  }, []);

  const handleGoogleSignIn = React.useCallback(async () => {
    if (!onGoogleSignIn) return;
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await onGoogleSignIn();
    } catch (error) {
      setFormState((prev) => ({ ...prev, error: getErrorMessage(error) }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [onGoogleSignIn]);

  // Wrap the form submission to catch any unhandled errors
  const handleFormSubmitWrapper = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        await handleSubmit(handleFormSubmit, handleFormInvalid)(e);
      } catch (error) {
        // Catch any errors that escape from react-hook-form
        if (process.env.NODE_ENV !== 'production') {
          console.warn('🧪 [UI] Form submission handled error:', error);
        }
        setFormState((prev) => ({ 
          ...prev, 
          error: getErrorMessage(error),
          isLoading: false 
        }));
      }
    },
    [handleSubmit, handleFormSubmit, handleFormInvalid]
  );

  return (
    <motion.div
      data-slot="auth-sign-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleFormSubmitWrapper}>
        <div className="space-y-2">
          <Label htmlFor="email" className={cn(errors.email && "text-destructive")}>Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(
              errors.email && "border-destructive border-2 focus-visible:ring-2 focus-visible:ring-destructive bg-destructive/5"
            )}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className={cn(errors.password && "text-destructive")}>Password</Label>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={onForgotPassword}
              disabled={formState.isLoading}
            >
              Forgot password?
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(
                errors.password && "border-destructive border-2 focus-visible:ring-2 focus-visible:ring-destructive bg-destructive/5"
              )}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </AuthForm>

      <AuthSeparator />
      <AuthSocialButtons isLoading={formState.isLoading} onGoogleClick={handleGoogleSignIn} />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Button variant="link" className="h-auto p-0 text-sm" onClick={onSignUp} disabled={formState.isLoading}>
          Create one
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Sign Up Component
// --------------------------------

interface AuthSignUpProps {
  onSubmit: (values: SignUpFormValues) => Promise<void>;
  onSignIn: () => void;
  onGoogleSignIn?: () => Promise<void>;
}

function AuthSignUp({ onSubmit, onSignIn, onGoogleSignIn }: AuthSignUpProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", terms: false },
  });

  const terms = watch("terms", false);
  const password = watch("password", "");

  const handleFormSubmit = async (data: SignUpFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      console.log('📝 [UI] Sign up form submitted:', { email: data.email, name: data.name });
      await onSubmit(data);
      console.log('✅ [UI] Sign up successful, showing confirmation screen');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('📝 [UI] Sign up handled error:', error);
      }
      setFormState((prev) => ({ ...prev, error: getErrorMessage(error) }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleFormInvalid = React.useCallback((errors: FieldErrors<SignUpFormValues>) => {
    const fieldError = getFirstFieldError(errors);
    setFormState((prev) => ({
      ...prev,
      error: fieldError ?? DEFAULT_VALIDATION_ERROR,
      isLoading: false,
    }));
  }, []);

  const handleGoogleSignIn = React.useCallback(async () => {
    if (!onGoogleSignIn) return;
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await onGoogleSignIn();
    } catch (error) {
      setFormState((prev) => ({ ...prev, error: getErrorMessage(error) }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [onGoogleSignIn]);

  // Wrap the form submission to catch any unhandled errors
  const handleFormSubmitWrapper = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        await handleSubmit(handleFormSubmit, handleFormInvalid)(e);
      } catch (error) {
        // Catch any errors that escape from react-hook-form
        if (process.env.NODE_ENV !== 'production') {
          console.warn('🧪 [UI] Form submission handled error:', error);
        }
        setFormState((prev) => ({ 
          ...prev, 
          error: getErrorMessage(error),
          isLoading: false 
        }));
      }
    },
    [handleSubmit, handleFormSubmit, handleFormInvalid]
  );

  return (
    <motion.div
      data-slot="auth-sign-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Get started with your account</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleFormSubmitWrapper}>
        <div className="space-y-2">
          <Label htmlFor="name" className={cn(errors.name && "text-destructive")}>Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            disabled={formState.isLoading}
            className={cn(
              errors.name && "border-destructive border-2 focus-visible:ring-2 focus-visible:ring-destructive bg-destructive/5"
            )}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={cn(errors.email && "text-destructive")}>Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(
              errors.email && "border-destructive border-2 focus-visible:ring-2 focus-visible:ring-destructive bg-destructive/5"
            )}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className={cn(errors.password && "text-destructive")}>Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(
                errors.password && "border-destructive border-2 focus-visible:ring-2 focus-visible:ring-destructive bg-destructive/5"
              )}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <FieldError message={errors.password?.message} />
          <PasswordStrengthIndicator password={password} className="mt-2" />
        </div>

        <div className={cn("flex items-center space-x-2 rounded-md p-3", errors.terms && "bg-destructive/5 border-2 border-destructive")}>
          <Checkbox
            id="terms"
            checked={Boolean(terms)}
            onCheckedChange={(checked) => setValue("terms", checked === true)}
            disabled={formState.isLoading}
            className={cn(errors.terms && "border-destructive")}
          />
          <div className="space-y-1">
            <Label htmlFor="terms" className={cn("text-sm", errors.terms && "text-destructive")}>
              I agree to the terms
            </Label>
            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Button asChild variant="link" className="h-auto p-0 text-xs">
                <Link href="/terms">Terms</Link>
              </Button>{" "}
              and{" "}
              <Button asChild variant="link" className="h-auto p-0 text-xs">
                <Link href="/privacy">Privacy Policy</Link>
              </Button>
              .
            </p>
          </div>
        </div>
        <FieldError message={errors.terms?.message} />

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </AuthForm>

      <AuthSeparator />
      <AuthSocialButtons isLoading={formState.isLoading} onGoogleClick={handleGoogleSignIn} />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <Button variant="link" className="h-auto p-0 text-sm" onClick={onSignIn} disabled={formState.isLoading}>
          Sign in
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Forgot Password Component
// --------------------------------

interface AuthForgotPasswordProps {
  onSignIn: () => void;
  onSuccess: () => void;
  onSubmit?: (values: ForgotPasswordFormValues) => Promise<void>;
}

function AuthForgotPassword({ onSignIn, onSuccess, onSubmit }: AuthForgotPasswordProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleFormSubmit = async (data: ForgotPasswordFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      onSuccess();
    } catch (error) {
      setFormState((prev) => ({ ...prev, error: getErrorMessage(error) }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleFormInvalid = React.useCallback((errors: FieldErrors<ForgotPasswordFormValues>) => {
    const fieldError = getFirstFieldError(errors);
    setFormState((prev) => ({
      ...prev,
      error: fieldError ?? DEFAULT_VALIDATION_ERROR,
      isLoading: false,
    }));
  }, []);

  // Wrap the form submission to catch any unhandled errors
  const handleFormSubmitWrapper = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        await handleSubmit(handleFormSubmit, handleFormInvalid)(e);
      } catch (error) {
        // Catch any errors that escape from react-hook-form
        if (process.env.NODE_ENV !== 'production') {
          console.warn('🧪 [UI] Form submission handled error:', error);
        }
        setFormState((prev) => ({ 
          ...prev, 
          error: getErrorMessage(error),
          isLoading: false 
        }));
      }
    },
    [handleSubmit, handleFormSubmit, handleFormInvalid]
  );

  return (
    <motion.div
      data-slot="auth-forgot-password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4"
        onClick={onSignIn}
        disabled={formState.isLoading}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Back</span>
      </Button>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your email to receive a reset link</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleFormSubmitWrapper}>
        <div className="space-y-2">
          <Label htmlFor="email" className={cn(errors.email && "text-destructive")}>Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(
              errors.email && "border-destructive border-2 focus-visible:ring-2 focus-visible:ring-destructive bg-destructive/5"
            )}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </AuthForm>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Button variant="link" className="h-auto p-0 text-sm" onClick={onSignIn} disabled={formState.isLoading}>
          Sign in
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Update Password Component
// --------------------------------

interface AuthUpdatePasswordProps {
  onSubmit?: (password: string) => Promise<void>;
  onSuccess: () => void;
}

function AuthUpdatePassword({ onSubmit, onSuccess }: AuthUpdatePasswordProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const password = watch("password", "");

  const handleFormSubmit = async (data: UpdatePasswordFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await onSubmit?.(data.password);
      setFormState((prev) => ({ ...prev, isLoading: false }));
      onSuccess();
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        error: getErrorMessage(error),
        isLoading: false,
      }));
    }
  };

  const handleFormInvalid = React.useCallback((errors: FieldErrors<UpdatePasswordFormValues>) => {
    const errorMessages = Object.values(errors)
      .map((error) => error.message)
      .filter(Boolean);
    
    const errorMessage = errorMessages.length > 0
      ? errorMessages[0]
      : DEFAULT_VALIDATION_ERROR;
    
    setFormState((prev) => ({ ...prev, error: errorMessage || null }));
  }, []);

  const handleFormSubmitWrapper = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit(handleFormSubmit, handleFormInvalid)(e);
    },
    [handleSubmit, handleFormSubmit, handleFormInvalid]
  );

  return (
    <motion.div
      data-slot="auth-update-password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Set new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose a strong password for your account</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleFormSubmitWrapper}>
        <div className="space-y-2">
          <Label htmlFor="password" className={cn(errors.password && "text-destructive")}>New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(
                errors.password && "border-destructive border-2 focus-visible:ring-2 focus-visible:ring-destructive bg-destructive/5"
              )}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <FieldError message={errors.password?.message} />
          <PasswordStrengthIndicator password={password} className="mt-2" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className={cn(errors.confirmPassword && "text-destructive")}>Confirm Password</Label>
          <Input
            id="confirmPassword"
            type={formState.showPassword ? "text" : "password"}
            placeholder="••••••••"
            disabled={formState.isLoading}
            className={cn(
              errors.confirmPassword && "border-destructive border-2 focus-visible:ring-2 focus-visible:ring-destructive bg-destructive/5"
            )}
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating password...
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </AuthForm>
    </motion.div>
  );
}

// --------------------------------
// Reset Success Component
// --------------------------------

interface AuthResetSuccessProps {
  onSignIn: () => void;
}

function AuthResetSuccess({ onSignIn }: AuthResetSuccessProps) {
  return (
    <motion.div
      data-slot="auth-reset-success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col items-center p-8 text-center"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a password reset link to your email.
      </p>

      <Button variant="outline" className="mt-6 w-full max-w-xs" onClick={onSignIn}>
        Back to sign in
      </Button>

      <p className="mt-6 text-xs text-muted-foreground">
        No email? Check spam or{" "}
        <Button variant="link" className="h-auto p-0 text-xs">
          try another email
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Signup Success Component
// --------------------------------

interface AuthSignupSuccessProps {
  onSignIn: () => void;
  email?: string;
  onResendVerification?: (email: string) => Promise<void>;
}

function AuthSignupSuccess({ onSignIn, email, onResendVerification }: AuthSignupSuccessProps) {
  const [isResending, setIsResending] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    
    setIsResending(true);
    setResendMessage(null);
    
    try {
      if (onResendVerification) {
        await onResendVerification(email);
        setResendMessage("Verification email sent! Please check your inbox.");
      } else {
        // Fallback if no handler provided
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResendMessage("Verification email sent! Please check your inbox.");
      }
    } catch (error: any) {
      setResendMessage(error.message || "Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      data-slot="auth-signup-success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col items-center p-8 text-center"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <MailCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Account created successfully!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {email ? (
          <>We sent a verification email to <strong>{email}</strong>. Please check your inbox and click the verification link to activate your account.</>
        ) : (
          <>We sent a verification email to your address. Please check your inbox and click the verification link to activate your account.</>
        )}
      </p>

      <div className="mt-6 space-y-3 w-full max-w-xs">
        <Button variant="default" className="w-full" onClick={onSignIn}>
          Back to sign in
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Important:</strong> Check your spam/junk folder if you don't receive the email within a few minutes.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-xs text-muted-foreground">
          Didn't receive the email?{" "}
          <Button 
            variant="link" 
            className="h-auto p-0 text-xs"
            onClick={handleResend}
            disabled={isResending || !email}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin inline" />
                Sending...
              </>
            ) : (
              "Resend verification"
            )}
          </Button>
        </p>
        {resendMessage && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            {resendMessage}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// --------------------------------
// Exports
// --------------------------------

export {
  Auth,
  AuthSignIn,
  AuthSignUp,
  AuthForgotPassword,
  AuthUpdatePassword,
  AuthResetSuccess,
  AuthSignupSuccess,
  AuthForm,
  AuthError,
  AuthSocialButtons,
  AuthSeparator,
};
