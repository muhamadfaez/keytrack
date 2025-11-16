import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { UserDataTable } from "@/components/users/UserDataTable";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
export function UsersPage() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore((state) => state.user);
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Users"
            subtitle="Manage all users in the university system."
          >
            {user?.role === 'admin' && (
              <Button onClick={() => setAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            )}
          </PageHeader>
          <div className="mb-4">
            <Input
              placeholder="Search users by name, email, or department..."
              className="w-full md:max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <UserDataTable searchTerm={searchTerm} />
        </div>
      </div>
      <AddUserDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
    </AppLayout>
  );
}