import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '../ui/button';
type DeleteDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  itemName: string;
  itemType: string;
  confirmationText?: string;
};
export function DeleteDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isPending,
  itemName,
  itemType,
  confirmationText = "Yes, delete"
}: DeleteDialogProps) {
  const isDestructive = confirmationText.toLowerCase().includes('delete') || confirmationText.toLowerCase().includes('lost');
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently update the {itemType}{' '}
            <strong>"{itemName}"</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={isDestructive ? "destructive" : "default"} onClick={onConfirm} disabled={isPending}>
              {isPending ? "Processing..." : confirmationText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}