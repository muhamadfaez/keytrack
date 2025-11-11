import React, { useEffect } from 'react';
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
import { useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { Room } from '@shared/types';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  description: z.string().optional(),
});
type EditRoomDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomData: Room;
};
export function EditRoomDialog({ isOpen, onOpenChange, roomData }: EditRoomDialogProps) {
  const form = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: roomData.roomNumber,
      description: roomData.description,
    },
  });
  useEffect(() => {
    if (roomData) {
      form.reset(roomData);
    }
  }, [roomData, form]);
  const updateRoomMutation = useApiMutation<Room, Partial<Room>>(
    (updatedRoom) => api(`/api/rooms/${roomData.id}`, { method: 'PUT', body: JSON.stringify(updatedRoom) }),
    [['rooms']]
  );
  const onSubmit = (values: z.infer<typeof roomSchema>) => {
    updateRoomMutation.mutate(values, {
      onSuccess: (data) => {
        toast.success(`Room "${data.roomNumber}" updated successfully!`);
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(`Failed to update room: ${error.message}`);
      },
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Room: {roomData.roomNumber}</DialogTitle>
          <DialogDescription>
            Update the details for this room or area.
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
                    <Input {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={updateRoomMutation.isPending}>
                {updateRoomMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}