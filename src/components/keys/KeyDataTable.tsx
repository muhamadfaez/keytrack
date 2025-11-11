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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Key, KeyStatus } from "@shared/types";
import { IssueKeyDialog } from './IssueKeyDialog';
import { Card, CardContent } from '../ui/card';
const mockKeys: Key[] = [
  { id: 'k1', keyNumber: 'M-101', keyType: 'Master', roomNumber: 'Building A', status: 'Issued' },
  { id: 'k2', keyNumber: 'S-205', keyType: 'Single', roomNumber: '205', status: 'Available' },
  { id: 'k3', keyNumber: 'SM-3', keyType: 'Sub-Master', roomNumber: '3rd Floor', status: 'Overdue' },
  { id: 'k4', keyNumber: 'S-101A', keyType: 'Single', roomNumber: '101A', status: 'Available' },
  { id: 'k5', keyNumber: 'S-101B', keyType: 'Single', roomNumber: '101B', status: 'Available' },
  { id: 'k6', keyNumber: 'M-GYM', keyType: 'Master', roomNumber: 'Gymnasium', status: 'Lost' },
  { id: 'k7', keyNumber: 'S-LIB1', keyType: 'Single', roomNumber: 'Library Main', status: 'Issued' },
];
const StatusBadge = ({ status }: { status: KeyStatus }) => {
  const variant: "default" | "secondary" | "destructive" | "outline" = {
    Available: "secondary",
    Issued: "default",
    Overdue: "destructive",
    Lost: "outline",
  }[status];
  return <Badge variant={variant}>{status}</Badge>;
};
export function KeyDataTable() {
  const [isIssueDialogOpen, setIssueDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const handleIssueKey = (key: Key) => {
    setSelectedKey(key);
    setIssueDialogOpen(true);
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
                {mockKeys.map((key) => (
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
                ))}
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
        />
      )}
    </>
  );
}