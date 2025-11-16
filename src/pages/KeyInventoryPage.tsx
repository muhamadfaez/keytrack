import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { KeyDataTable } from "@/components/keys/KeyDataTable";
import { AddKeyDialog } from "@/components/keys/AddKeyDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 md:py-8">
          <PageHeader
            title="Key Inventory"
            subtitle="Manage all keys in the university system."
            className="!mb-6"
          >
            {user?.role === 'admin' && (
              <Button onClick={() => setAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Key
              </Button>
            )}
          </PageHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="w-full md:max-w-sm">
              <Input
                placeholder="Search keys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Issued">Fully Issued</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="Sub-Master">Sub-Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <KeyDataTable
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            searchTerm={searchTerm}
          />
        </div>
      </div>
      <AddKeyDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
    </AppLayout>
  );
}