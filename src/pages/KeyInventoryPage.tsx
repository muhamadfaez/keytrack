import { useState } from "react";
import { Navigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { KeyDataTable } from "@/components/keys/KeyDataTable";
import { AddKeyDialog } from "@/components/keys/AddKeyDialog";
import { useAuthStore } from "@/stores/authStore";
export function KeyInventoryPage() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const user = useAuthStore((state) => state.user);
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Key Inventory"
            subtitle="Manage all keys in the university system."
          >
            {user?.role === 'admin' && (
              <Button onClick={() => setAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Key
              </Button>
            )}
          </PageHeader>
          <KeyDataTable
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            setTypeFilter={setTypeFilter}
          />
        </div>
      </div>
      <AddKeyDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
    </>
  );
}