import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Inbox } from "lucide-react";
import { PopulatedAssignment } from "@shared/types";
import { Card, CardContent } from '../ui/card';
import { useApi } from '@/hooks/useApi';
import { Skeleton } from '../ui/skeleton';
import { EmptyState } from '../layout/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
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
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-destructive">
            Error loading your keys: {error.message}
          </TableCell>
        </TableRow>
      );
    }
    if (!assignments || assignments.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
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
      </TableRow>
    ));
  };
  return (
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
              </TableRow>
            </TableHeader>
            <TableBody>{renderContent()}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}