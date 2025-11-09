"use client";

import React, { useMemo, useCallback } from "react";
import Link, { LinkProps } from "next/link";
import { useNavigation } from "@/contexts/NavigationContext";
import { useRouter } from "next/navigation";

interface NavigationLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children: React.ReactNode;
}

export function NavigationLink({ children, onClick, ...props }: NavigationLinkProps) {
  const { startNavigation } = useNavigation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't show loader for same-page links or external links
    const href = props.href.toString();
    if (href.startsWith('#') || href.startsWith('http')) {
      onClick?.(e);
      return;
    }

    startNavigation();
    onClick?.(e);
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}

// Hook for programmatic navigation with loader
export function useNavigationRouter() {
  const router = useRouter();
  const { startNavigation } = useNavigation();

  const push = useCallback((href: string) => {
    startNavigation();
    router.push(href);
  }, [router, startNavigation]);

  const replace = useCallback((href: string) => {
    startNavigation();
    router.replace(href);
  }, [router, startNavigation]);

  const back = useCallback(() => {
    startNavigation();
    router.back();
  }, [router, startNavigation]);

  const forward = useCallback(() => {
    startNavigation();
    router.forward();
  }, [router, startNavigation]);

  return useMemo(() => ({
    push,
    replace,
    back,
    forward,
    refresh: router.refresh,
    prefetch: router.prefetch,
  }), [push, replace, back, forward, router.refresh, router.prefetch]);
}
