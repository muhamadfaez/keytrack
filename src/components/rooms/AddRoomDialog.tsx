import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useApi, useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { Room, Key } from '@shared/types';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  description: z.string().optional(),
  keyId: z.string().optional(),
});
type AddRoomDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};
export function AddRoomDialog({ isOpen, onOpenChange }: AddRoomDialogProps) {
  const { data: keysData, isLoading: isLoadingKeys } = useApi<{ items: Key[] }>(['keys']);
  const form = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: "",
      description: "",
      keyId: "none",
    },
  });
  const createRoomMutation = useApiMutation<Room, Partial<Room> & { keyId?: string }>(
    (newRoom) => api('/api/rooms', { method: 'POST', body: JSON.stringify(newRoom) }),
    [['rooms'], ['keys']]
  );
  const onSubmit = (values: z.infer<typeof roomSchema>) => {
    const finalValues = { ...values, keyId: values.keyId === 'none' ? undefined : values.keyId };
    createRoomMutation.mutate(finalValues, {
      onSuccess: (data) => {
        toast.success(`Room "${data.roomNumber}" created successfully!`);
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(`Failed to create room: ${error.message}`);
      },
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>
            Enter the details for the new room or area.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number / Area Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Room 101, Main Auditorium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Located on the first floor, west wing." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associate Key (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingKeys ? "Loading keys..." : "Select a key to associate"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {keysData?.items.map((key) => (
                        <SelectItem key={key.id} value={key.id}>
                          {key.keyNumber} ({key.roomNumber || 'No room assigned'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createRoomMutation.isPending}>
                {createRoomMutation.isPending ? "Adding..." : "Add Room"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}