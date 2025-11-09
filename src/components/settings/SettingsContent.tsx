"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Bell, Moon, Trash2, FileText } from "lucide-react";
import { TextLengthSelector } from "./TextLengthSelector";
import { TEXT_LENGTH_EXAMPLES } from "@/types/preferences";
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

export function SettingsContent() {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [frontTextLength, setFrontTextLength] = useState<"Short" | "Medium" | "Long">("Medium");
  const [backTextLength, setBackTextLength] = useState<"Short" | "Medium" | "Long">("Medium");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const savedPreferences = localStorage.getItem(`preferences_${user.id}`);
      if (savedPreferences) {
        try {
          const prefs = JSON.parse(savedPreferences);
          setFrontTextLength(prefs.frontTextLength || "Medium");
          setBackTextLength(prefs.backTextLength || "Medium");
        } catch (error) {
          console.error("Error loading preferences:", error);
        }
      }
    }
  }, [user]);

  // Auto-save preferences when they change
  useEffect(() => {
    if (user && autoSave && typeof window !== "undefined") {
      const savePreferences = async () => {
        const preferences = {
          frontTextLength,
          backTextLength,
          updatedAt: new Date().toISOString(),
        };

        try {
          localStorage.setItem(`preferences_${user.id}`, JSON.stringify(preferences));
          setSaveMessage("Options are automatically saved to your account.");
          setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
          console.error("Error saving preferences:", error);
        }
      };

      const timeoutId = setTimeout(savePreferences, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [frontTextLength, backTextLength, user, autoSave]);

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    console.log("Delete account requested");
    alert("Account deletion feature coming soon!");
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Flashcard Text Length Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Flashcard Text Length</CardTitle>
            </div>
            <CardDescription>
              Customize the length of questions and answers in your flashcards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <TextLengthSelector
                value={frontTextLength}
                onChange={setFrontTextLength}
                label="Front Text Length"
                exampleFront={TEXT_LENGTH_EXAMPLES.front[frontTextLength]}
                disabled={!user}
              />
              <TextLengthSelector
                value={backTextLength}
                onChange={setBackTextLength}
                label="Back Text Length"
                exampleBack={TEXT_LENGTH_EXAMPLES.back[backTextLength]}
                disabled={!user}
              />
            </div>
            {saveMessage && (
              <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400">{saveMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your application preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your flashcards
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle dark mode theme
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto-save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save your progress
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{user?.email || "Not logged in"}</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={signOut}>
                Sign Out
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers including all your flashcards
                      and study progress.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Information about the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">2025.10.15</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
