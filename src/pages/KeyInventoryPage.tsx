import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { KeyDataTable } from "@/components/keys/KeyDataTable";
export function KeyInventoryPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Key Inventory"
            subtitle="Manage all keys in the university system."
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Key
            </Button>
          </PageHeader>
          <KeyDataTable />
        </div>
      </div>
    </AppLayout>
  );
}