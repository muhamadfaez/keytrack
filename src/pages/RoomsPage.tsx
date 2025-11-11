import { useState } from "react";
import { Navigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { RoomDataTable } from "@/components/rooms/RoomDataTable";
import { AddRoomDialog } from "@/components/rooms/AddRoomDialog";
export function RoomsPage() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Rooms Management"
            subtitle="Manage all rooms and areas in the system."
          >
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Room
            </Button>
          </PageHeader>
          <RoomDataTable />
        </div>
      </div>
      <AddRoomDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
    </>
  );
}