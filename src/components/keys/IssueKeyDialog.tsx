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
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Key, Personnel } from "@shared/types";
import { cn } from "@/lib/utils";
type IssueKeyDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  keyData: Key;
};
const mockPersonnel: Personnel[] = [
  { id: 'p1', name: 'Alice Johnson', email: 'alice.j@university.edu', department: 'Facilities Management', phone: '(555) 123-4567' },
  { id: 'p2', name: 'Dr. Bob Williams', email: 'bob.w@university.edu', department: 'Physics Department', phone: '(555) 234-5678' },
  { id: 'p3', name: 'Charlie Brown', email: 'charlie.b@university.edu', department: 'Student Housing', phone: '(555) 345-6789' },
];
export function IssueKeyDialog({ isOpen, onOpenChange, keyData }: IssueKeyDialogProps) {
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
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
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent>
                {mockPersonnel.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} ({person.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit">Issue Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}