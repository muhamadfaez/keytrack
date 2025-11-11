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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Key, KeyStatus } from "@shared/types";
import { IssueKeyDialog } from './IssueKeyDialog';
import { Card, CardContent } from '../ui/card';
import { useApi } from '@/hooks/useApi';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
const StatusBadge = ({ status }: { status: KeyStatus }) => {
  const variantMap: Record<KeyStatus, BadgeProps["variant"]> = {
    Available: "secondary",
    Issued: "default",
    Overdue: "destructive",
    Lost: "outline",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
};
export function KeyDataTable() {
  const { data: keysData, isLoading, error } = useApi<{ items: Key[] }>(['keys']);
  const [isIssueDialogOpen, setIssueDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const handleIssueKey = (key: Key) => {
    setSelectedKey(key);
    setIssueDialogOpen(true);
  };
  const handleIssueSuccess = () => {
    if (selectedKey) {
      toast.success(`Key "${selectedKey.keyNumber}" has been successfully issued.`);
    }
  };
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={5}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
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
    if (!keysData || keysData.items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-muted-foreground">
            No keys found.
          </TableCell>
        </TableRow>
      );
    }
    return keysData.items.map((key) => (
      <TableRow key={key.id}>
        <TableCell className="font-medium">{key.keyNumber}</TableCell>
        <TableCell>{key.keyType}</TableCell>
        <TableCell>{key.roomNumber}</TableCell>
        <TableCell>
          <StatusBadge status={key.status} />
        </TableCell>
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
              <DropdownMenuItem onClick={() => handleIssueKey(key)} disabled={key.status !== 'Available'}>
                Issue Key
              </DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
          <div className="flex items-center justify-between mb-4">
            <Input placeholder="Search keys..." className="max-w-sm" />
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
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderContent()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {selectedKey && (
        <IssueKeyDialog
          isOpen={isIssueDialogOpen}
          onOpenChange={setIssueDialogOpen}
          keyData={selectedKey}
          onSuccess={handleIssueSuccess}
        />
      )}
    </>
  );
}