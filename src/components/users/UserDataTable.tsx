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
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Inbox } from "lucide-react";
import { User } from "@shared/types";
import { Card, CardContent } from '../ui/card';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import { EmptyState } from '../layout/EmptyState';
import { EditUserDialog } from './EditUserDialog';
import { DeleteDialog } from '../keys/DeleteDialog';
import { UserKeyHistorySheet } from './UserKeyHistorySheet';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '../ui/badge';
type SortableKey = keyof User;
type SortDirection = 'ascending' | 'descending';
type UserDataTableProps = {
  searchTerm: string;
};
export function UserDataTable({ searchTerm }: UserDataTableProps) {
  const { data: usersData, isLoading, error } = useApi<{ items: User[] }>(['users']);
  const currentUser = useAuthStore((state) => state.user);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: SortDirection } | null>(null);
  const [dialogState, setDialogState] = useState<{
    edit?: User;
    delete?: User;
    history?: User;
  }>({});
  const sortedUsers = useMemo(() => {
    let sortableItems = usersData?.items ? [...usersData.items] : [];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [usersData, sortConfig]);
  const filteredUsers = useMemo(() => {
    if (!sortedUsers) return [];
    return sortedUsers.filter(user =>
      (user.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.roomNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedUsers, searchTerm]);
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
    (userId) => api(`/api/users/${userId}`, { method: 'DELETE' }),
    [['users']]
  );
  const handleDelete = () => {
    if (!dialogState.delete) return;
    deleteMutation.mutate(dialogState.delete.id, {
      onSuccess: () => {
        toast.success(`User "${dialogState.delete?.name}" deleted successfully.`);
        setDialogState({});
      },
      onError: (err) => {
        toast.error(`Failed to delete user: ${err.message}`);
      }
    });
  };
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-destructive">
            Error loading users: {error.message}
          </TableCell>
        </TableRow>
      );
    }
    if (filteredUsers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6}>
            <EmptyState
              icon={<Inbox className="h-12 w-12" />}
              title="No Users Found"
              description="No users match your search. Try adding a new user."
            />
          </TableCell>
        </TableRow>
      );
    }
    return filteredUsers.map((user) => (
      <TableRow key={user.id}>
        <TableCell className="font-medium">{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.department}</TableCell>
        <TableCell>{user.roomNumber || 'N/A'}</TableCell>
        <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge></TableCell>
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
              <DropdownMenuItem onClick={() => setDialogState({ history: user })}>
                View Key History
              </DropdownMenuItem>
              {currentUser?.role === 'admin' && (
                <>
                  <DropdownMenuItem onClick={() => setDialogState({ edit: user })}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => setDialogState({ delete: user })}
                    disabled={user.id === currentUser.id}
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
      <Card>
        <CardContent className="pt-6">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('name')}>
                      Name {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('email')}>
                      Email {getSortIcon('email')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('department')}>
                      Department {getSortIcon('department')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('roomNumber')}>
                      Room/Area {getSortIcon('roomNumber')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('role')}>
                      Role {getSortIcon('role')}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderContent()}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {dialogState.edit && (
        <EditUserDialog
          isOpen={!!dialogState.edit}
          onOpenChange={(open) => !open && setDialogState({})}
          userData={dialogState.edit}
        />
      )}
      {dialogState.delete && (
        <DeleteDialog
          isOpen={!!dialogState.delete}
          onOpenChange={(open) => !open && setDialogState({})}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
          itemName={dialogState.delete.name}
          itemType="user"
        />
      )}
      <UserKeyHistorySheet
        isOpen={!!dialogState.history}
        onOpenChange={(open) => !open && setDialogState({})}
        userData={dialogState.history || null}
      />
    </>
  );
}