"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserAccountMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleMyAccount = () => {
    router.push("/profile");
  };

  // Get user's display name (email username or full name)
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  // Get avatar URL from user metadata (for Google sign-in)
  // Google OAuth can store the avatar in different fields
  const rawAvatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.photo_url ||
    user.identities?.[0]?.identity_data?.avatar_url ||
    user.identities?.[0]?.identity_data?.picture;

  // Remove size parameter from Google avatar URL to get better quality and avoid CORS issues
  const avatarUrl = rawAvatarUrl ? rawAvatarUrl.replace(/=s\d+-c$/, '') : null;

  // Get user initials for fallback
  const userInitials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  const parseStreak = (value: unknown, fallback = 1): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  };

  const streakValue = parseStreak(
    user.user_metadata?.study_streak ?? user.user_metadata?.streak ?? user.user_metadata?.active_streak,
  );

  const formatStreak = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(streakValue)));

  return (
    <div className="relative">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 hover:bg-secondary/80 transition-colors outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            {avatarUrl ? (
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-muted">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-sm font-medium whitespace-nowrap">
              {displayName}
            </span>
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-400/15 dark:text-amber-100">
              <span role="img" aria-label="fire">🔥</span>
              {formatStreak}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
          <DropdownMenuItem
            onClick={handleMyAccount}
            className="cursor-pointer"
          >
            My Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
