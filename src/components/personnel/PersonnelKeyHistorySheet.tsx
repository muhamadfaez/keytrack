import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Personnel, PopulatedAssignment } from "@shared/types";
import { useApi } from '@/hooks/useApi';
import { format } from 'date-fns';
import { KeyRound, Calendar, CheckCircle, AlertTriangle, History, CaseSensitive } from 'lucide-react';
import { EmptyState } from '../layout/EmptyState';
type PersonnelKeyHistorySheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personnelData: Personnel | null;
};
export function PersonnelKeyHistorySheet({ isOpen, onOpenChange, personnelData }: PersonnelKeyHistorySheetProps) {
  const { data: assignments, isLoading, error } = useApi<PopulatedAssignment[]>(
    ['personnel', personnelData?.id, 'keys'],
    { enabled: !!personnelData?.id && isOpen }
  );
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }
    if (error) {
      return <p className="text-destructive text-center">Error loading key history: {error.message}</p>;
    }
    if (!assignments || assignments.length === 0) {
      return (
        <EmptyState
          icon={<History className="h-12 w-12" />}
          title="No Key History"
          description="This person has no current or past key assignments."
        />
      );
    }
    const sortedAssignments = [...assignments].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    return (
      <div className="space-y-4">
        {sortedAssignments.map(item => (
          <div key={item.id} className="border rounded-lg p-4 flex items-start space-x-4">
            <div className="mt-1">
              {item.returnDate ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : item.key.status === 'Overdue' ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <KeyRound className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{item.key.keyNumber}</p>
                  <p className="text-xs text-muted-foreground capitalize flex items-center">
                    <CaseSensitive className="h-3 w-3 mr-1" /> {item.assignmentType}
                  </p>
                </div>
                <Badge variant={item.returnDate ? 'outline' : (item.key.status === 'Overdue' ? 'destructive' : 'secondary')}>
                  {item.returnDate ? 'Returned' : item.key.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.key.roomNumber}</p>
              <div className="text-xs text-muted-foreground mt-2 flex items-center">
                <Calendar className="h-3 w-3 mr-1.5" />
                <span>Issued: {format(new Date(item.issueDate), 'MMM d, yyyy')}</span>
                <span className="mx-2">|</span>
                <span>Due: {item.dueDate ? format(new Date(item.dueDate), 'MMM d, yyyy') : 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Key History: {personnelData?.name}</SheetTitle>
          <SheetDescription>
            Viewing all keys currently and previously assigned to this person.
          </SheetDescription>
        </SheetHeader>
        {renderContent()}
      </SheetContent>
    </Sheet>
  );
}