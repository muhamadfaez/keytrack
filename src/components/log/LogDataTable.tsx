import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Inbox } from "lucide-react";
import { Notification } from "@shared/types";
import { Card, CardContent } from '../ui/card';
import { useApi } from '@/hooks/useApi';
import { Skeleton } from '../ui/skeleton';
import { EmptyState } from '../layout/EmptyState';
import { format } from 'date-fns';
import { Input } from '../ui/input';
export function LogDataTable() {
  const { data: logs, isLoading, error } = useApi<Notification[]>(['log']);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(log =>
      log.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={2}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={2} className="text-center text-destructive">
            Error loading transaction log: {error.message}
          </TableCell>
        </TableRow>
      );
    }
    if (filteredLogs.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={2}>
            <EmptyState
              icon={<Inbox className="h-12 w-12" />}
              title="No Log Entries Found"
              description={searchTerm ? "No entries match your search." : "The transaction log is currently empty."}
            />
          </TableCell>
        </TableRow>
      );
    }
    return filteredLogs.map((log) => (
      <TableRow key={log.id}>
        <TableCell>{log.message}</TableCell>
        <TableCell className="text-right text-muted-foreground">
          {format(new Date(log.timestamp), "MMM dd, yyyy 'at' h:mm:ss a")}
        </TableCell>
      </TableRow>
    ));
  };
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <Input
            placeholder="Search log entries..."
            className="w-full md:max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderContent()}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}