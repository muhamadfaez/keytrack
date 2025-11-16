import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { KeyRequestDataTable } from "@/components/requests/KeyRequestDataTable";
import { AddKeyRequestDialog } from "@/components/requests/AddKeyRequestDialog";
export function KeyRequestsPage() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Key Requests"
            subtitle="Manage all key borrow requests from personnel."
          >
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </PageHeader>
          <KeyRequestDataTable />
        </div>
      </div>
      <AddKeyRequestDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
    </AppLayout>
  );
}