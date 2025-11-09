"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Auth, AuthView } from "@/components/ui/auth-form-1";
import { useAuth } from "@/lib/auth";

interface AuthFormProps {
  onSuccess?: () => void;
}

type AuthComponentProps = React.ComponentProps<typeof Auth>;
type ForgotPasswordHandler = NonNullable<AuthComponentProps["onForgotPassword"]>;

export function AuthForm({ onSuccess }: AuthFormProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsString = searchParams?.toString() ?? "";
  const { signIn, signUp, signInWithGoogle, signInWithOtp, resetPassword, updatePassword, resendVerificationEmail } = useAuth();

  const defaultView = React.useMemo<AuthComponentProps["defaultView"]>(() => {
    const params = new URLSearchParams(paramsString);
    const viewParam = params.get("view");
    if (!viewParam) return undefined;
    if ((Object.values(AuthView) as string[]).includes(viewParam)) {
      return viewParam as AuthView;
    }
    return undefined;
  }, [paramsString]);

  const handleSuccess = React.useCallback(() => {
    onSuccess?.();
    router.push("/dashboard");
  }, [onSuccess, router]);

  const handleViewChange = React.useCallback<NonNullable<AuthComponentProps["onViewChange"]>>(
    (nextView) => {
      const params = new URLSearchParams(paramsString);
      if (nextView === AuthView.SIGN_IN) {
        params.delete("view");
      } else {
        params.set("view", nextView);
      }

      const query = params.toString();
      const target = `${pathname}${query ? `?${query}` : ""}`;
      router.replace(target, { scroll: false });
    },
    [paramsString, pathname, router],
  );

  const handleSignIn = React.useCallback<AuthComponentProps["onSignIn"]>(
    async ({ email, password }) => {
      const trimmedEmail = email.trim();
      const normalizedPassword = password?.trim() ?? "";
      
      // Password is now required - no OTP fallback
      if (!normalizedPassword) {
        throw new Error('Password is required');
      }
      
      const result = await signIn(trimmedEmail, normalizedPassword);
      if (result.error) {
        throw new Error(result.error.message);
      }
    },
    [signIn],
  );

  const handleSignUp = React.useCallback<AuthComponentProps["onSignUp"]>(
    async ({ email, password, name }) => {
      const result = await signUp(email.trim(), password, name.trim());
      if (result.error) {
        throw new Error(result.error.message);
      }
    },
    [signUp],
  );

  const handleForgotPassword = React.useCallback<ForgotPasswordHandler>(
    async ({ email }) => {
      await resetPassword(email.trim());
    },
    [resetPassword],
  );

  const handleUpdatePassword = React.useCallback(
    async (password: string) => {
      await updatePassword(password);
    },
    [updatePassword],
  );

  const handleResendVerification = React.useCallback(
    async (email: string) => {
      await resendVerificationEmail(email);
    },
    [resendVerificationEmail],
  );

  return (
    <Auth
      defaultView={defaultView}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onForgotPassword={handleForgotPassword}
      onUpdatePassword={handleUpdatePassword}
      onSignInWithGoogle={signInWithGoogle}
      onResendVerification={handleResendVerification}
      onSuccess={handleSuccess}
      onViewChange={handleViewChange}
    />
  );
}
