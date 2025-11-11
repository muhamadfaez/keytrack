import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { BarChart3 } from "lucide-react";
export function ReportsPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Reports"
            subtitle="Generate and view reports on key activity."
          />
          <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-muted rounded-lg p-12 h-96">
            <BarChart3 className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">Reporting Feature Coming Soon</h2>
            <p className="mt-2 text-muted-foreground">
              Data visualizations and detailed reports will be available here.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}