import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Key, PopulatedKeyRequest, KeyRequest } from "@shared/types";
import { useApi, useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
type ApproveRequestDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: PopulatedKeyRequest;
};
export function ApproveRequestDialog({ isOpen, onOpenChange, request }: ApproveRequestDialogProps) {
  const [selectedKeyId, setSelectedKeyId] = useState<string | undefined>();
  const { data: keysData, isLoading: isLoadingKeys } = useApi<{ items: Key[] }>(['keys']);
  const approveMutation = useApiMutation<KeyRequest, { keyId: string }>(
    (payload) => api(`/api/requests/${request.id}/approve`, { method: 'POST', body: JSON.stringify(payload) }),
    [['requests'], ['keys'], ['assignments'], ['notifications'], ['stats'], ['reports', 'summary']]
  );
  const availableKeys = useMemo(() => {
    if (!keysData) return [];
    // A simple filter based on the requested key info.
    // A more sophisticated system might use tags or specific properties.
    return keysData.items.filter(key =>
      key.status === 'Available' &&
      (key.keyNumber.toLowerCase().includes(request.requestedKeyInfo.toLowerCase()) ||
        key.roomNumber.toLowerCase().includes(request.requestedKeyInfo.toLowerCase()))
    );
  }, [keysData, request.requestedKeyInfo]);
  const handleSubmit = () => {
    if (!selectedKeyId) {
      toast.error("Please select a key to assign.");
      return;
    }
    approveMutation.mutate({ keyId: selectedKeyId }, {
      onSuccess: () => {
        toast.success("Request approved and key issued.");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("Failed to approve request", { description: error.message });
      }
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Approve Key Request</DialogTitle>
          <DialogDescription>
            Select an available key to fulfill the request for <span className="font-semibold">{request.personnel.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Request</Label>
            <p className="col-span-3 text-sm font-medium">{request.requestedKeyInfo}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="key" className="text-right">
              Available Key
            </Label>
            <Select onValueChange={setSelectedKeyId} value={selectedKeyId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={isLoadingKeys ? "Loading keys..." : "Select a key"} />
              </SelectTrigger>
              <SelectContent>
                {availableKeys.length > 0 ? (
                  availableKeys.map((key) => (
                    <SelectItem key={key.id} value={key.id}>
                      {key.keyNumber} ({key.roomNumber})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">No matching available keys found.</div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={approveMutation.isPending || !selectedKeyId}>
            {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve & Issue Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}