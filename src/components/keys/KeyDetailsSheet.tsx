import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Key, PopulatedAssignment } from "@shared/types";
import { useApi } from '@/hooks/useApi';
import { format } from 'date-fns';
import { User, Clock, Calendar, Hash, KeyRound, MapPin, History, CaseSensitive } from 'lucide-react';
import { EmptyState } from '../layout/EmptyState';
type KeyDetailsSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  keyData: Key | null;
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
export function KeyDetailsSheet({ isOpen, onOpenChange, keyData }: KeyDetailsSheetProps) {
  const { data: history, isLoading, error } = useApi<PopulatedAssignment[]>(
    ['keys', keyData?.id, 'history'],
    { enabled: !!keyData?.id && isOpen }
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
      return <p className="text-destructive text-center">Error loading history: {error.message}</p>;
    }
    if (!history || history.length === 0) {
      return (
        <EmptyState
          icon={<History className="h-12 w-12" />}
          title="No Assignment History"
          description="This key has not been issued to anyone yet."
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
            <p className="font-semibold">{item.personnel.name}</p>
            <p className="text-sm text-muted-foreground capitalize flex items-center">
              <CaseSensitive className="h-3 w-3 mr-1.5" /> Type: {item.assignmentType}
            </p>
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
          <SheetTitle>Key Details: {keyData?.keyNumber}</SheetTitle>
          <SheetDescription>
            Viewing comprehensive details and assignment history for this key.
          </SheetDescription>
        </SheetHeader>
        {keyData ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Information</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <DetailItem icon={<Hash size={16} />} label="Key Number" value={keyData.keyNumber} />
                <DetailItem icon={<KeyRound size={16} />} label="Type" value={keyData.keyType} />
                <DetailItem icon={<MapPin size={16} />} label="Room/Area" value={keyData.roomNumber} />
                <div className="flex items-start text-sm">
                  <div className="text-muted-foreground mr-3 mt-0.5"><Clock size={16} /></div>
                  <div className="flex flex-col">
                    <span className="font-medium text-muted-foreground">Status</span>
                    <Badge variant={keyData.status === 'Overdue' || keyData.status === 'Lost' ? 'destructive' : 'secondary'}>{keyData.status}</Badge>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4">Assignment History</h3>
              {renderHistory()}
            </div>
          </div>
        ) : (
          <p>No key selected.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}