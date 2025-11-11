import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Settings } from "lucide-react";
export function SettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Settings"
            subtitle="Manage application settings and preferences."
          />
          <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-muted rounded-lg p-12 h-96">
            <Settings className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">Settings Page Coming Soon</h2>
            <p className="mt-2 text-muted-foreground">
              User roles, notifications, and system configurations will be managed here.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}