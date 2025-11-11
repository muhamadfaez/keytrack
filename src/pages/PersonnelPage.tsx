import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Personnel } from "@shared/types";
import { useApi } from "@/hooks/useApi";
import { PersonnelDataTable } from "@/components/personnel/PersonnelDataTable";
import { AddPersonnelDialog } from "@/components/personnel/AddPersonnelDialog";
import { useAuthStore } from "@/stores/authStore";
export function PersonnelPage() {
  const { data: personnelData, isLoading, error } = useApi<{ items: Personnel[] }>(['personnel']);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore((state) => state.user);
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Personnel"
            subtitle="Manage all faculty, staff, and contractors."
          >
            {user?.role === 'admin' && (
              <Button onClick={() => setAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Personnel
              </Button>
            )}
          </PageHeader>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Input
                  placeholder="Search personnel..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <PersonnelDataTable
                data={personnelData?.items || []}
                isLoading={isLoading}
                error={error}
                searchTerm={searchTerm}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <AddPersonnelDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
    </AppLayout>
  );
}