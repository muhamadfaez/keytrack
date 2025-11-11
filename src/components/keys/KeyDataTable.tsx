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
import { Input } from "@/components/ui/input";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Key, KeyStatus } from "@shared/types";
import { IssueKeyDialog } from './IssueKeyDialog';
import { EditKeyDialog } from './EditKeyDialog';
import { DeleteDialog } from './DeleteDialog';
import { KeyDetailsSheet } from './KeyDetailsSheet';
import { Card, CardContent } from '../ui/card';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
const StatusBadge = ({ status }: { status: KeyStatus }) => {
  const variantMap: Record<KeyStatus, BadgeProps["variant"]> = {
    Available: "secondary",
    Issued: "default",
    Overdue: "destructive",
    Lost: "destructive",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
};
export function KeyDataTable() {
  const { data: keysData, isLoading, error, refetch } = useApi<{ items: Key[] }>(['keys']);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogState, setDialogState] = useState<{
    issue?: Key;
    edit?: Key;
    delete?: Key;
    return?: Key;
    lost?: Key;
    details?: Key;
  }>({});
  const filteredKeys = useMemo(() => {
    if (!keysData?.items) return [];
    return keysData.items.filter(key =>
      key.keyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.keyType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [keysData, searchTerm]);
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
        toast.success(`Key "${dialogState.return?.keyNumber}" has been returned.`);
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
        toast.warning(`Key "${dialogState.lost?.keyNumber}" has been reported as lost.`);
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
          <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-destructive">
            Error loading keys: {error.message}
          </TableCell>
        </TableRow>
      );
    }
    if (filteredKeys.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-muted-foreground">
            No keys found.
          </TableCell>
        </TableRow>
      );
    }
    return filteredKeys.map((key) => (
      <TableRow key={key.id}>
        <TableCell className="font-medium">{key.keyNumber}</TableCell>
        <TableCell>{key.keyType}</TableCell>
        <TableCell>{key.roomNumber}</TableCell>
        <TableCell><StatusBadge status={key.status} /></TableCell>
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
              <DropdownMenuItem onClick={() => setDialogState({ issue: key })} disabled={key.status !== 'Available'}>
                Issue Key
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDialogState({ return: key })} disabled={key.status === 'Available' || key.status === 'Lost'}>
                Return Key
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDialogState({ edit: key })}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => setDialogState({ lost: key })}
                disabled={key.status === 'Lost' || key.status === 'Available'}
              >
                Report Lost
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => setDialogState({ delete: key })}>
                Delete
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
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Search keys..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={() => refetch()}>Refresh</Button>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Room/Area</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm">
                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
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