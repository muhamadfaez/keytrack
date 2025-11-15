import React, { useState } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Key, Personnel, KeyAssignment } from "@shared/types";
import { cn } from "@/lib/utils";
import { useApi, useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
type IssueKeyDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  keyData: Key;
  onSuccess?: () => void;
};
export function IssueKeyDialog({ isOpen, onOpenChange, keyData, onSuccess }: IssueKeyDialogProps) {
  const [personnelId, setPersonnelId] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [assignmentType, setAssignmentType] = useState<"event" | "personal">("event");
  const { data: personnelData, isLoading: isLoadingPersonnel } = useApi<{ items: Personnel[] }>(['personnel']);
  const issueKeyMutation = useApiMutation<KeyAssignment, Partial<KeyAssignment>>(
    (newAssignment) => api('/api/assignments', { method: 'POST', body: JSON.stringify(newAssignment) }),
    [['keys'], ['assignments', 'recent'], ['stats'], ['reports', 'summary']]
  );
  const handleSubmit = () => {
    if (!personnelId) {
      toast.error("Please select personnel.");
      return;
    }
    if (assignmentType === 'event' && !dueDate) {
      toast.error("Please select a due date for an event assignment.");
      return;
    }
    const assignmentData: Partial<KeyAssignment> = {
      keyId: keyData.id,
      personnelId,
      assignmentType,
      dueDate: assignmentType === 'event' ? dueDate?.toISOString() : undefined,
    };
    issueKeyMutation.mutate(assignmentData, {
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
        setPersonnelId(undefined);
        setDueDate(undefined);
        setAssignmentType("event");
      },
      onError: (error) => {
        toast.error(`Failed to issue key: ${error.message}`);
      },
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Issue Key: {keyData.keyNumber}</DialogTitle>
          <DialogDescription>
            Assign this key to a person and set a due date for its return.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="personnel" className="text-right">
              Personnel
            </Label>
            <Select onValueChange={setPersonnelId} value={personnelId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={isLoadingPersonnel ? "Loading..." : "Select a person"} />
              </SelectTrigger>
              <SelectContent>
                {personnelData?.items.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} ({person.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Type</Label>
            <RadioGroup
              defaultValue="event"
              className="col-span-3 flex items-center space-x-4"
              onValueChange={(value: "event" | "personal") => setAssignmentType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="event" id="r-event" />
                <Label htmlFor="r-event">Event</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="r-personal" />
                <Label htmlFor="r-personal">Personal</Label>
              </div>
            </RadioGroup>
          </div>
          {assignmentType === 'event' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due-date" className="text-right">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={issueKeyMutation.isPending}>
            {issueKeyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Issue Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}