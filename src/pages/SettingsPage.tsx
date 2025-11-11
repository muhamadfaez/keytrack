import { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { DeleteDialog } from '@/components/keys/DeleteDialog';
import { useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
export function SettingsPage() {
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);
  const resetMutation = useApiMutation<void, void>(
    () => api('/api/settings/reset', { method: 'POST' }),
    [['keys'], ['personnel'], ['assignments'], ['stats'], ['reports', 'summary'], ['assignments', 'recent'], ['notifications']]
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
  return (
    <>
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <PageHeader
              title="Settings"
              subtitle="Manage application settings and preferences."
            />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <AppearanceSettings />
                <NotificationSettings />
              </div>
              <div className="lg:col-span-1">
                <Card className="border-destructive">
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
        </div>
      </AppLayout>
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