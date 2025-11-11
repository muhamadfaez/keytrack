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
import { MoreHorizontal, Users } from "lucide-react";
import { Personnel } from "@shared/types";
import { Skeleton } from '@/components/ui/skeleton';
import { EditPersonnelDialog } from './EditPersonnelDialog';
import { DeleteDialog } from '../keys/DeleteDialog';
import { PersonnelKeyHistorySheet } from './PersonnelKeyHistorySheet';
import { useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { EmptyState } from '../layout/EmptyState';
type PersonnelDataTableProps = {
  data: Personnel[];
  isLoading: boolean;
  error: Error | null;
};
export function PersonnelDataTable({ data, isLoading, error }: PersonnelDataTableProps) {
  const [dialogState, setDialogState] = useState<{
    edit?: Personnel;
    delete?: Personnel;
    history?: Personnel;
  }>({});
  const deleteMutation = useApiMutation<{ id: string }, string>(
    (personnelId) => api(`/api/personnel/${personnelId}`, { method: 'DELETE' }),
    [['personnel']]
  );
  const handleDelete = () => {
    if (!dialogState.delete) return;
    deleteMutation.mutate(dialogState.delete.id, {
      onSuccess: () => {
        toast.success(`Personnel "${dialogState.delete?.name}" deleted successfully.`);
        setDialogState({});
      },
      onError: (err) => {
        toast.error(`Failed to delete personnel: ${err.message}`);
      }
    });
  };
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-destructive">Error: {error.message}</div>;
  }
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="No Personnel Found"
        description="Add new personnel to see them listed here."
      />
    );
  }
  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell>{person.department}</TableCell>
                <TableCell>{person.email}</TableCell>
                <TableCell>{person.phone}</TableCell>
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
                      <DropdownMenuItem onClick={() => setDialogState({ history: person })}>
                        View Assigned Keys
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDialogState({ edit: person })}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => setDialogState({ delete: person })}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {dialogState.edit && (
        <EditPersonnelDialog
          isOpen={!!dialogState.edit}
          onOpenChange={(open) => !open && setDialogState({})}
          personnelData={dialogState.edit}
        />
      )}
      {dialogState.delete && (
        <DeleteDialog
          isOpen={!!dialogState.delete}
          onOpenChange={(open) => !open && setDialogState({})}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
          itemName={dialogState.delete.name}
          itemType="personnel record"
        />
      )}
      <PersonnelKeyHistorySheet
        isOpen={!!dialogState.history}
        onOpenChange={(open) => !open && setDialogState({})}
        personnelData={dialogState.history || null}
      />
    </>
  );
}