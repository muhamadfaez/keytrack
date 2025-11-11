import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Inbox, MoreHorizontal } from "lucide-react";
import { PopulatedAssignment, Key } from "@shared/types";
import { Card, CardContent } from '../ui/card';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { Skeleton } from '../ui/skeleton';
import { EmptyState } from '../layout/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
import { DeleteDialog } from '../keys/DeleteDialog';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
const StatusBadge = ({ status }: { status: PopulatedAssignment['status'] }) => {
  const variantMap: Record<PopulatedAssignment['status'], BadgeProps["variant"]> = {
    Issued: "secondary",
    Returned: "default",
    Overdue: "destructive",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
};
export function MyKeysDataTable() {
  const user = useAuthStore((state) => state.user);
  const { data: assignments, isLoading, error } = useApi<PopulatedAssignment[]>(
    ['users', user?.id, 'keys'],
    { enabled: !!user?.id }
  );
  const [dialogState, setDialogState] = useState<{ lost?: PopulatedAssignment }>({});
  const lostMutation = useApiMutation<Key, { keyId: string, userId: string }>(
    ({ keyId, userId }) => api(`/api/keys/${keyId}/lost`, { method: 'POST', body: JSON.stringify({ userId }) }),
    [['keys'], ['assignments', 'recent'], ['users', user?.id, 'keys'], ['stats']]
  );
  const handleReportLost = () => {
    if (!dialogState.lost || !user) return;
    lostMutation.mutate({ keyId: dialogState.lost.keyId, userId: user.id }, {
      onSuccess: () => {
        toast.warning(`Key "${dialogState.lost?.key.keyNumber}" has been reported as lost.`);
        setDialogState({});
      },
      onError: (err) => {
        toast.error(`Failed to report key as lost: ${err.message}`);
      }
    });
  };
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-destructive">
            Error loading your keys: {error.message}
          </TableCell>
        </TableRow>
      );
    }
    if (!assignments || assignments.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6}>
            <EmptyState
              icon={<Inbox className="h-12 w-12" />}
              title="No Keys Assigned"
              description="You do not have any keys assigned to you at the moment."
            />
          </TableCell>
        </TableRow>
      );
    }
    return assignments.map((assignment) => (
      <TableRow key={assignment.id}>
        <TableCell className="font-medium">{assignment.key.keyNumber}</TableCell>
        <TableCell>{assignment.key.roomNumber}</TableCell>
        <TableCell>{format(new Date(assignment.issueDate), "MMM dd, yyyy")}</TableCell>
        <TableCell>{assignment.dueDate ? format(new Date(assignment.dueDate), "MMM dd, yyyy") : 'N/A'}</TableCell>
        <TableCell><StatusBadge status={assignment.status} /></TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => setDialogState({ lost: assignment })}
                disabled={assignment.status === 'Returned'}
              >
                Report Lost
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key Number</TableHead>
                  <TableHead>Room/Area</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderContent()}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {dialogState.lost && (
        <DeleteDialog
          isOpen={!!dialogState.lost}
          onOpenChange={(open) => !open && setDialogState({})}
          onConfirm={handleReportLost}
          isPending={lostMutation.isPending}
          itemName={dialogState.lost.key.keyNumber}
          itemType="key as lost"
          confirmationText="Yes, report lost"
        />
      )}
    </>
  );
}