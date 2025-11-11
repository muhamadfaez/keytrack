import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, LogIn } from "lucide-react";
import { DeleteDialog } from '@/components/keys/DeleteDialog';
import { useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { useSettingsStore } from '@/stores/settingsStore';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LogoSettings } from '@/components/settings/LogoSettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { useAuthStore } from '@/stores/authStore';
import { AppNameSettings } from '@/components/settings/AppNameSettings';
export function SettingsPage() {
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);
  const enableGoogleAuth = useSettingsStore((state) => state.auth.enableGoogleAuth);
  const toggleGoogleAuth = useSettingsStore((state) => state.toggleGoogleAuth);
  const user = useAuthStore((state) => state.user);
  const resetMutation = useApiMutation<void, void>(
    () => api('/api/settings/reset', { method: 'POST' }),
    [['keys'], ['personnel'], ['assignments'], ['stats'], ['reports', 'summary'], ['assignments', 'recent'], ['notifications'], ['profile']]
  );
  const handleReset = () => {
    resetMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("System Reset Complete", {
          description: "All data has been cleared successfully.",
        });
        setResetDialogOpen(false);
      },
      onError: (error) => {
        toast.error("Reset Failed", {
          description: error.message,
        });
      }
    });
  };
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Settings"
            subtitle="Manage application settings and preferences."
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AppearanceSettings />
            <AppNameSettings />
            <LogoSettings />
            <NotificationSettings />
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-muted-foreground" />
                  Authentication
                </CardTitle>
                <CardDescription>
                  Configure how users can sign in to the application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="google-auth" className="flex flex-col space-y-1 cursor-pointer">
                    <span>Google Sign-In</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Allow users to sign in with their Google account.
                    </span>
                  </Label>
                  <Switch
                    id="google-auth"
                    checked={enableGoogleAuth}
                    onCheckedChange={toggleGoogleAuth}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive lg:col-start-3 transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  System Reset
                </CardTitle>
                <CardDescription>
                  Permanently delete all keys, personnel, and assignment records. This action is irreversible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use this option to clear the system for a fresh start or to remove demo data.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={() => setResetDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Data
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      <DeleteDialog
        isOpen={isResetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleReset}
        isPending={resetMutation.isPending}
        itemName="ALL SYSTEM DATA"
        itemType="system data"
        confirmationText="Yes, reset system"
      />
    </>
  );
}