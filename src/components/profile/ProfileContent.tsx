"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  BookOpen,
  Brain,
  Calendar,
  FileText,
  LogOut,
  Mail,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LinkedIdentities } from "./LinkedIdentities";

export function ProfileContent() {
  const { user, signOut } = useAuth();
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scrollbarOffset, setScrollbarOffset] = useState(0);

  useEffect(() => {
    if (user?.created_at) {
      setFormattedDate(
        new Date(user.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    }
  }, [user?.created_at]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const computeOffset = () => {
      const width = window.innerWidth - document.documentElement.clientWidth;
      if (!isDeleteDialogOpen) {
        setScrollbarOffset(0);
        return;
      }
      setScrollbarOffset(width > 0 ? width : 0);
    };

    computeOffset();
    window.addEventListener("resize", computeOffset);
    return () => {
      window.removeEventListener("resize", computeOffset);
      setScrollbarOffset(0);
    };
  }, [isDeleteDialogOpen]);

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : "U";

  const rawAvatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.photo_url ||
    user.identities?.[0]?.identity_data?.avatar_url ||
    user.identities?.[0]?.identity_data?.picture;

  const avatarUrl = rawAvatarUrl ? rawAvatarUrl.replace(/=s\d+-c$/, "") : null;

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.username ||
    user.email?.split("@")[0] ||
    "Explorer";

  const headline =
    user.user_metadata?.headline ||
    "Design a learning flow that feels personal and playful.";

  const parseNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
  };

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
      Math.max(0, Math.round(value)),
    );

  const flashcardCount = parseNumber(
    user.user_metadata?.flashcards_count ?? user.user_metadata?.flashcardsCreated,
  );
  const pdfCount = parseNumber(user.user_metadata?.pdfs_uploaded);
  const sessionCount = parseNumber(
    user.user_metadata?.study_sessions ?? user.user_metadata?.sessions_completed,
  );
  const streakLength = parseNumber(user.user_metadata?.study_streak, 1);

  const quickHighlights = [
    {
      label: "Flashcards created",
      helper: "Your total cards across decks",
      value: flashcardCount,
      icon: BookOpen,
      gradient: "from-blue-500/25 via-blue-500/10 to-transparent",
    },
    {
      label: "PDFs uploaded",
      helper: "Imported documents",
      value: pdfCount,
      icon: FileText,
      gradient: "from-primary/20 via-primary/5 to-transparent",
    },
    {
      label: "Study sessions",
      helper: "Guided or manual reviews",
      value: sessionCount,
      icon: Brain,
      gradient: "from-emerald-500/25 via-emerald-500/10 to-transparent",
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    console.log("Delete account requested");
    alert("Account deletion feature coming soon!");
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background to-muted/40"
      style={
        isDeleteDialogOpen && scrollbarOffset
          ? { marginRight: `-${scrollbarOffset}px` }
          : undefined
      }
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[-10%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[15%] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl space-y-12 px-4 py-12">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-background/70 p-8 shadow-[0_40px_120px_-60px_rgba(79,70,229,0.7)] backdrop-blur supports-[backdrop-filter]:bg-background/40"
        >
          <div className="absolute inset-y-0 right-[-20%] hidden w-1/2 translate-y-10 rotate-12 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent md:block" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_55%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative mx-auto h-28 w-28 shrink-0 md:mx-0">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl" />
                <div className="relative h-full w-full overflow-hidden rounded-full border border-primary/30 bg-background/80 p-1">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.email || "User avatar"}
                      className="h-full w-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Avatar className="h-full w-full border border-primary/30 bg-gradient-to-br from-primary/80 to-primary/60">
                      <AvatarFallback className="text-3xl font-semibold text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-start">
                  <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-400/20 dark:text-amber-200">
                    <span role="img" aria-label="fire">
                      🔥
                    </span>
                    {formatNumber(Math.max(streakLength, 0))} day streak
                  </span>
                </div>
                <p className="mt-3 text-base text-muted-foreground md:text-lg">{headline}</p>
              </div>
            </div>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickHighlights.map(({ label, value, helper, icon: Icon, gradient }) => (
              <div
                key={label}
                className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 dark:bg-zinc-900/60 dark:hover:bg-zinc-900"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-90`} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {label}
                    </span>
                    <p className="mt-2 text-3xl font-semibold text-foreground">{formatNumber(value)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
                  </div>
                  <span className="rounded-full bg-white/50 p-2 shadow-sm backdrop-blur dark:bg-zinc-800/80">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="grid gap-6"
        >
          <Card className="border-white/10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
            <CardHeader>
              <CardTitle>Account overview</CardTitle>
              <CardDescription>Key details that keep everything up to date</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-xl border border-white/10 p-4">
                <span className="rounded-full bg-primary/10 p-2">
                  <Mail className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold text-foreground">{user.email}</p>
                </div>
              </div>
              {formattedDate && (
                <div className="flex items-start gap-4 rounded-xl border border-white/10 p-4">
                  <span className="rounded-full bg-emerald-500/10 p-2">
                    <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Member since</p>
                    <p className="text-sm font-semibold text-foreground">{formattedDate}</p>
                  </div>
                </div>
              )}
              {lastSignIn && (
                <div className="flex items-start gap-4 rounded-xl border border-white/10 p-4">
                  <span className="rounded-full bg-sky-500/10 p-2">
                    <Sparkles className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Last sign-in</p>
                    <p className="text-sm font-semibold text-foreground">{lastSignIn}</p>
                  </div>
                </div>
              )}
              <div className="md:col-span-2 mt-4 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Delete account?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone and will remove all of your decks, flashcards, and study history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Permanently delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <LinkedIdentities />
        </motion.section>
      </div>
    </div>
  );
}
