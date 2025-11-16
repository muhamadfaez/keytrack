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
import { useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { KeyRequest, PopulatedKeyRequest } from '@shared/types';
import { toast } from 'sonner';
type RejectRequestDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: PopulatedKeyRequest;
};
export function RejectRequestDialog({ isOpen, onOpenChange, request }: RejectRequestDialogProps) {
  const rejectMutation = useApiMutation<KeyRequest, void>(
    () => api(`/api/requests/${request.id}/reject`, { method: 'POST' }),
    [['requests'], ['notifications']]
  );
  const handleConfirm = () => {
    rejectMutation.mutate(undefined, {
      onSuccess: () => {
        toast.warning("Key request has been rejected.");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("Failed to reject request", { description: error.message });
      }
    });
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to reject this request?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark the request from <span className="font-semibold">{request.personnel.name}</span> for "{request.requestedKeyInfo}" as rejected. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={rejectMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleConfirm} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? "Rejecting..." : "Yes, reject request"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}