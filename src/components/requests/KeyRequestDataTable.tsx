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
import { Badge, BadgeProps } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Inbox } from "lucide-react";
import { PopulatedKeyRequest, KeyRequestStatus } from "@shared/types";
import { Card, CardContent } from '../ui/card';
import { useApi } from '@/hooks/useApi';
import { Skeleton } from '../ui/skeleton';
import { EmptyState } from '../layout/EmptyState';
import { format } from 'date-fns';
import { ApproveRequestDialog } from './ApproveRequestDialog';
import { RejectRequestDialog } from './RejectRequestDialog';
import { useAuthStore } from '@/stores/authStore';
const StatusBadge = ({ status }: { status: KeyRequestStatus }) => {
  const variantMap: Record<KeyRequestStatus, BadgeProps["variant"]> = {
    Pending: "default",
    Approved: "secondary",
    Rejected: "destructive",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
};
type SortableKey = keyof PopulatedKeyRequest | 'user.name';
type SortDirection = 'ascending' | 'descending';
export function KeyRequestDataTable() {
  const user = useAuthStore((state) => state.user);
  const requestsPath = user?.role === 'admin' ? 'requests' : `requests?userId=${user?.id}`;
  const { data: requests, isLoading, error } = useApi<PopulatedKeyRequest[]>(
    [requestsPath],
    { enabled: !!user?.id }
  );
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: SortDirection } | null>(null);
  const [dialogState, setDialogState] = useState<{
    approve?: PopulatedKeyRequest;
    reject?: PopulatedKeyRequest;
  }>({});
  const sortedRequests = useMemo(() => {
    let sortableItems = requests ? [...requests] : [];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const getVal = (item: PopulatedKeyRequest, key: SortableKey) => {
          if (key === 'user.name') return item.user.name;
          return item[key as keyof PopulatedKeyRequest];
        };
        const aVal = getVal(a, sortConfig.key);
        const bVal = getVal(b, sortConfig.key);
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [requests, sortConfig]);
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
            Error loading requests: {error.message}
          </TableCell>
        </TableRow>
      );
    }
    if (sortedRequests.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6}>
            <EmptyState
              icon={<Inbox className="h-12 w-12" />}
              title="No Key Requests"
              description="There are no pending or completed key requests."
            />
          </TableCell>
        </TableRow>
      );
    }
    return sortedRequests.map((request) => (
      <TableRow key={request.id}>
        <TableCell className="font-medium">{request.user.name}</TableCell>
        <TableCell>{request.requestedKeyInfo}</TableCell>
        <TableCell><StatusBadge status={request.status} /></TableCell>
        <TableCell>{format(new Date(request.issueDate), "MMM dd, yyyy")}</TableCell>
        <TableCell>{request.dueDate ? format(new Date(request.dueDate), "MMM dd, yyyy") : 'N/A'}</TableCell>
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
              {user?.role === 'admin' && (
                <>
                  <DropdownMenuItem onSelect={() => setDialogState({ approve: request })} disabled={request.status !== 'Pending'}>
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setDialogState({ reject: request })}
                    disabled={request.status !== 'Pending'}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    Reject
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
                    <Button variant="ghost" size="sm" onClick={() => requestSort('user.name')}>
                      Requester {getSortIcon('user.name')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('requestedKeyInfo')}>
                      Requested Key {getSortIcon('requestedKeyInfo')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('status')}>
                      Status {getSortIcon('status')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('issueDate')}>
                      Issue Date {getSortIcon('issueDate')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => requestSort('dueDate')}>
                      Due Date {getSortIcon('dueDate')}
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
      {dialogState.approve && (
        <ApproveRequestDialog
          isOpen={!!dialogState.approve}
          onOpenChange={(open) => !open && setDialogState({})}
          request={dialogState.approve}
        />
      )}
      {dialogState.reject && (
        <RejectRequestDialog
          isOpen={!!dialogState.reject}
          onOpenChange={(open) => !open && setDialogState({})}
          request={dialogState.reject}
        />
      )}
    </>
  );
}