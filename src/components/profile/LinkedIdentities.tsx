"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail, Key, Chrome, Loader2, Link as LinkIcon, Unlink, ShieldCheck } from "lucide-react";
import { UserIdentity } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

export function LinkedIdentities() {
  const { getUserIdentities, unlinkIdentity, linkGoogleIdentity } = useAuth();
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [identityToUnlink, setIdentityToUnlink] = useState<UserIdentity | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  const loadIdentities = async () => {
    try {
      setLoading(true);
      const data = await getUserIdentities();
      setIdentities(data);
    } catch (error) {
      console.error("Failed to load identities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load authentication methods",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdentities();
  }, []);

  const handleUnlinkClick = (identity: UserIdentity) => {
    setIdentityToUnlink(identity);
  };

  const handleUnlinkConfirm = async () => {
    if (!identityToUnlink) return;

    try {
      setUnlinkingId(identityToUnlink.id);
      await unlinkIdentity(identityToUnlink);
      toast({
        title: "Success",
        description: `${getProviderName(identityToUnlink.provider)} has been unlinked from your account`,
      });
      await loadIdentities();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to unlink authentication method",
      });
    } finally {
      setUnlinkingId(null);
      setIdentityToUnlink(null);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      setIsLinking(true);
      await linkGoogleIdentity();
      toast({
        title: "Success",
        description: "Google account linked successfully",
      });
      await loadIdentities();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to link Google account",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return Chrome;
      case "email":
        return Mail;
      default:
        return Key;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return "Google";
      case "email":
        return "Email/Password";
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return "from-blue-500/25 via-blue-500/10 to-transparent";
      case "email":
        return "from-emerald-500/25 via-emerald-500/10 to-transparent";
      default:
        return "from-gray-500/25 via-gray-500/10 to-transparent";
    }
  };

  const hasGoogleLinked = identities.some(id => id.provider.toLowerCase() === "google");
  const canUnlink = identities.length > 1;

  if (loading) {
    return (
      <Card className="border-white/10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Linked Accounts
          </CardTitle>
          <CardDescription>Loading your authentication methods...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Card className="border-white/10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Linked Accounts
                </CardTitle>
                <CardDescription>
                  Manage how you sign in to your account. You must have at least one method linked.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {identities.length} {identities.length === 1 ? "method" : "methods"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing identities */}
            <div className="space-y-3">
              {identities.map((identity) => {
                const Icon = getProviderIcon(identity.provider);
                const providerName = getProviderName(identity.provider);
                const gradient = getProviderColor(identity.provider);
                const isUnlinking = unlinkingId === identity.id;

                return (
                  <div
                    key={identity.id}
                    className="group relative overflow-hidden rounded-xl border border-white/15 bg-white/50 p-4 transition-all duration-300 hover:bg-white/70 dark:bg-zinc-900/60 dark:hover:bg-zinc-900"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-90`} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="rounded-full bg-white/50 p-2 shadow-sm backdrop-blur dark:bg-zinc-800/80">
                          <Icon className="h-5 w-5 text-primary" />
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{providerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {identity.identity_data?.email || "Connected"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <LinkIcon className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                        {canUnlink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnlinkClick(identity)}
                            disabled={isUnlinking}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {isUnlinking ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Unlink className="mr-2 h-4 w-4" />
                                Unlink
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add more methods */}
            {!hasGoogleLinked && (
              <div className="mt-6 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Link Google Account</p>
                    <p className="text-sm text-muted-foreground">
                      Add Google sign-in as an alternative way to access your account
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLinkGoogle}
                    disabled={isLinking}
                  >
                    {isLinking ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Chrome className="mr-2 h-4 w-4" />
                    )}
                    Link Google
                  </Button>
                </div>
              </div>
            )}

            {!canUnlink && (
              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> You must have at least 2 authentication methods before you can unlink one.
                  Consider adding another sign-in method first.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Unlink confirmation dialog */}
      <AlertDialog
        open={!!identityToUnlink}
        onOpenChange={(open) => !open && setIdentityToUnlink(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink authentication method?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink{" "}
              <strong>{identityToUnlink && getProviderName(identityToUnlink.provider)}</strong> from
              your account? You'll no longer be able to sign in using this method.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlinkConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
