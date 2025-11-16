import React, { useState, useMemo } from 'react';
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
import { MoreHorizontal, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Personnel } from "@shared/types";
import { Skeleton } from '@/components/ui/skeleton';
import { EditPersonnelDialog } from './EditPersonnelDialog';
import { DeleteDialog } from '../keys/DeleteDialog';
import { PersonnelKeyHistorySheet } from './PersonnelKeyHistorySheet';
import { useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { EmptyState } from '../layout/EmptyState';
import { useAuthStore } from '@/stores/authStore';
type SortableKey = keyof Personnel;
type SortDirection = 'ascending' | 'descending';
type PersonnelDataTableProps = {
  data: Personnel[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
};
export function PersonnelDataTable({ data, isLoading, error, searchTerm }: PersonnelDataTableProps) {
  const user = useAuthStore((state) => state.user);
  const [dialogState, setDialogState] = useState<{
    edit?: Personnel;
    delete?: Personnel;
    history?: Personnel;
  }>({});
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: SortDirection } | null>(null);
  const sortedAndFilteredData = useMemo(() => {
    let processableData = data ? [...data] : [];
    // Filtering
    if (searchTerm) {
      processableData = processableData.filter(person =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Sorting
    if (sortConfig !== null) {
      processableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return processableData;
  }, [data, searchTerm, sortConfig]);
  const requestSort = (key: SortableKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  const getSortIcon = (key: SortableKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };
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
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-destructive">Error: {error.message}</TableCell>
        </TableRow>
      );
    }
    if (!sortedAndFilteredData || sortedAndFilteredData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="No Personnel Found"
              description={searchTerm ? "No personnel match your search." : "Add new personnel to see them listed here."}
            />
          </TableCell>
        </TableRow>
      );
    }
    return sortedAndFilteredData.map((person) => (
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
              {user?.role === 'admin' && (
                <>
                  <DropdownMenuItem onClick={() => setDialogState({ edit: person })}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => setDialogState({ delete: person })}
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };
  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => requestSort('name')}>Name {getSortIcon('name')}</Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => requestSort('department')}>Department {getSortIcon('department')}</Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => requestSort('email')}>Email {getSortIcon('email')}</Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => requestSort('phone')}>Phone {getSortIcon('phone')}</Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderContent()}
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