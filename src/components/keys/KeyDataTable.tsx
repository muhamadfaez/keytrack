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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Inbox } from "lucide-react";
import { Key } from "@shared/types";
import { IssueKeyDialog } from './IssueKeyDialog';
import { EditKeyDialog } from './EditKeyDialog';
import { DeleteDialog } from './DeleteDialog';
import { KeyDetailsSheet } from './KeyDetailsSheet';
import { Card, CardContent } from '../ui/card';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import { EmptyState } from '../layout/EmptyState';
import { useAuthStore } from '@/stores/authStore';
type SortableKey = keyof Key;
type SortDirection = 'ascending' | 'descending';
const StatusBadge = ({ available, total }: { available: number, total: number }) => {
  const isAvailable = available > 0;
  const variant: BadgeProps["variant"] = isAvailable ? "secondary" : "default";
  const text = isAvailable ? "Available" : "Fully Issued";
  return <Badge variant={variant}>{text}</Badge>;
};
type KeyDataTableProps = {
  statusFilter: string;
  typeFilter: string;
  searchTerm: string;
};
export function KeyDataTable({ statusFilter, typeFilter, searchTerm }: KeyDataTableProps) {
  const { data: keysData, isLoading, error } = useApi<{ items: Key[] }>(['keys']);
  const user = useAuthStore((state) => state.user);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: SortDirection } | null>(null);
  const [dialogState, setDialogState] = useState<{
    issue?: Key;
    edit?: Key;
    delete?: Key;
    return?: Key;
    lost?: Key;
    details?: Key;
  }>({});
  const sortedKeys = useMemo(() => {
    let sortableItems = keysData?.items ? [...keysData.items] : [];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [keysData, sortConfig]);
  const filteredKeys = useMemo(() => {
    if (!sortedKeys) return [];
    return sortedKeys.filter(key => {
      const getStatus = (k: Key) => k.availableQuantity > 0 ? 'Available' : 'Issued';
      const statusMatch = statusFilter === 'all' || getStatus(key) === statusFilter;
      const typeMatch = typeFilter === 'all' || key.keyType === typeFilter;
      const searchMatch =
        key.keyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.keyType.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && typeMatch && searchMatch;
    });
  }, [sortedKeys, searchTerm, statusFilter, typeFilter]);
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
    (keyId) => api(`/api/keys/${keyId}`, { method: 'DELETE' }),
    [['keys']]
  );
  const returnMutation = useApiMutation<Key, string>(
    (keyId) => api(`/api/keys/${keyId}/return`, { method: 'POST' }),
    [['keys'], ['assignments', 'recent']]
  );
  const lostMutation = useApiMutation<Key, string>(
    (keyId) => api(`/api/keys/${keyId}/lost`, { method: 'POST' }),
    [['keys'], ['assignments', 'recent']]
  );
  const handleDelete = () => {
    if (!dialogState.delete) return;
    deleteMutation.mutate(dialogState.delete.id, {
      onSuccess: () => {
        toast.success(`Key "${dialogState.delete?.keyNumber}" deleted successfully.`);
        setDialogState({});
      },
      onError: (err) => {
        toast.error(`Failed to delete key: ${err.message}`);
      }
    });
  };
  const handleReturn = () => {
    if (!dialogState.return) return;
    returnMutation.mutate(dialogState.return.id, {
      onSuccess: () => {
        toast.success(`A copy of key "${dialogState.return?.keyNumber}" has been returned.`);
        setDialogState({});
      },
      onError: (err) => {
        toast.error(`Failed to return key: ${err.message}`);
      }
    });
  };
  const handleReportLost = () => {
    if (!dialogState.lost) return;
    lostMutation.mutate(dialogState.lost.id, {
      onSuccess: () => {
        toast.warning(`A copy of key "${dialogState.lost?.keyNumber}" has been reported as lost.`);
        setDialogState({});
      },
      onError: (err) => {
        toast.error(`Failed to report key as lost: ${err.message}`);
      }
    });
  };
  const handleIssueSuccess = () => {
    if (dialogState.issue) {
      toast.success(`Key "${dialogState.issue.keyNumber}" has been successfully issued.`);
    }
  };
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center text-destructive">
            Error loading keys: {error.message}
          </TableCell>
        </TableRow>
      );
    }
    if (filteredKeys.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7}>
            <EmptyState
              icon={<Inbox className="h-12 w-12" />}
              title="No Keys Found"
              description="No keys match your current search or filter criteria. Try adding a new key."
            />
          </TableCell>
        </TableRow>
      );
    }
    return filteredKeys.map((key) => {
      const issuedCount = key.totalQuantity - key.availableQuantity;
      return (
        <TableRow key={key.id}>
          <TableCell className="font-medium">{key.keyNumber}</TableCell>
          <TableCell>{key.keyType}</TableCell>
          <TableCell>{key.roomNumber}</TableCell>
          <TableCell className="font-semibold text-center">{key.availableQuantity}</TableCell>
          <TableCell className="text-center">{key.totalQuantity}</TableCell>
          <TableCell><StatusBadge available={key.availableQuantity} total={key.totalQuantity} /></TableCell>
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
                <DropdownMenuItem onClick={() => setDialogState({ details: key })}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialogState({ issue: key })} disabled={key.availableQuantity <= 0}>
                  Issue Key
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialogState({ return: key })} disabled={issuedCount <= 0}>
                  Return Key
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuItem onClick={() => setDialogState({ edit: key })}>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => setDialogState({ lost: key })}
                      disabled={issuedCount <= 0}
                    >
                      Report Lost
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => setDialogState({ delete: key })}>
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      )
    });
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
                    <Button variant="ghost" size="sm" onClick={() => requestSort('keyNumber')}>
                      Key Number {getSortIcon('keyNumber')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('keyType')}>
                      Type {getSortIcon('keyType')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('roomNumber')}>
                      Room/Area {getSortIcon('roomNumber')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => requestSort('availableQuantity')}>
                      Available {getSortIcon('availableQuantity')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => requestSort('totalQuantity')}>
                      Total {getSortIcon('totalQuantity')}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderContent()}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {dialogState.issue && (
        <IssueKeyDialog
          isOpen={!!dialogState.issue}
          onOpenChange={(open) => !open && setDialogState({})}
          keyData={dialogState.issue}
          onSuccess={handleIssueSuccess}
        />
      )}
      {dialogState.edit && (
        <EditKeyDialog
          isOpen={!!dialogState.edit}
          onOpenChange={(open) => !open && setDialogState({})}
          keyData={dialogState.edit}
        />
      )}
      {dialogState.delete && (
        <DeleteDialog
          isOpen={!!dialogState.delete}
          onOpenChange={(open) => !open && setDialogState({})}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
          itemName={dialogState.delete.keyNumber}
          itemType="key"
        />
      )}
      {dialogState.return && (
        <DeleteDialog
          isOpen={!!dialogState.return}
          onOpenChange={(open) => !open && setDialogState({})}
          onConfirm={handleReturn}
          isPending={returnMutation.isPending}
          itemName={dialogState.return.keyNumber}
          itemType="key to be returned"
          confirmationText="Yes, return key"
        />
      )}
      {dialogState.lost && (
        <DeleteDialog
          isOpen={!!dialogState.lost}
          onOpenChange={(open) => !open && setDialogState({})}
          onConfirm={handleReportLost}
          isPending={lostMutation.isPending}
          itemName={dialogState.lost.keyNumber}
          itemType="key as lost"
          confirmationText="Yes, report lost"
        />
      )}
      <KeyDetailsSheet
        isOpen={!!dialogState.details}
        onOpenChange={(open) => !open && setDialogState({})}
        keyData={dialogState.details || null}
      />
    </>
  );
}