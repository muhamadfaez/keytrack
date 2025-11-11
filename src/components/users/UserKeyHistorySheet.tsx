import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { User, PopulatedAssignment } from "@shared/types";
import { useApi } from '@/hooks/useApi';
import { format } from 'date-fns';
import { Mail, Phone, Building, History, DoorOpen } from 'lucide-react';
import { EmptyState } from '../layout/EmptyState';
type UserKeyHistorySheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userData: User | null;
};
const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-start text-sm">
    <div className="text-muted-foreground mr-3 mt-0.5">{icon}</div>
    <div className="flex flex-col">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  </div>
);
export function UserKeyHistorySheet({ isOpen, onOpenChange, userData }: UserKeyHistorySheetProps) {
  const { data: history, isLoading, error } = useApi<PopulatedAssignment[]>(
    ['users', userData?.id, 'keys'],
    { enabled: !!userData?.id && isOpen }
  );
  const renderHistory = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }
    if (error) {
      return <p className="text-destructive text-center">Error loading key history: {error.message}</p>;
    }
    if (!history || history.length === 0) {
      return (
        <EmptyState
          icon={<History className="h-12 w-12" />}
          title="No Key History"
          description="This user has no current or past key assignments."
          className="py-4"
        />
      );
    }
    return (
      <div className="relative pl-6">
        <div className="absolute left-0 top-0 h-full w-px bg-border" />
        {history.map((item) => (
          <div key={item.id} className="relative mb-6">
            <div className="absolute -left-[30.5px] top-1.5 h-5 w-5 rounded-full bg-primary" />
            <p className="font-semibold">Key {item.key.keyNumber}</p>
            <p className="text-sm text-muted-foreground">
              Issued: {format(new Date(item.issueDate), 'MMM d, yyyy, h:mm a')}
            </p>
            {item.returnDate ? (
              <p className="text-sm text-muted-foreground">
                Returned: {format(new Date(item.returnDate), 'MMM d, yyyy, h:mm a')}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Due: {item.dueDate ? format(new Date(item.dueDate), 'MMM d, yyyy') : 'No due date'}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>User Details: {userData?.name}</SheetTitle>
          <SheetDescription>
            Viewing contact details and key assignment history for this user.
          </SheetDescription>
        </SheetHeader>
        {userData ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">User Information</h3>
              <div className="grid grid-cols-1 gap-y-4">
                <DetailItem icon={<Mail size={16} />} label="Email" value={userData.email} />
                <DetailItem icon={<Building size={16} />} label="Department" value={userData.department} />
                <DetailItem icon={<Phone size={16} />} label="Phone" value={userData.phone || 'Not provided'} />
                <DetailItem icon={<DoorOpen size={16} />} label="Room/Area" value={userData.roomNumber || 'Not assigned'} />
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Assignment History</h3>
              {renderHistory()}
            </div>
          </div>
        ) : (
          <p>No user selected.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}