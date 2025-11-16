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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiMutation } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { Key } from '@shared/types';
import { toast } from 'sonner';
const keySchema = z.object({
  keyNumber: z.string().min(1, "Key number is required"),
  keyType: z.enum(["Single", "Master", "Sub-Master"]),
  roomNumber: z.string().min(1, "Room/Area is required"),
  totalQuantity: z.number().int().positive("Quantity must be a positive number"),
});
type AddKeyDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};
export function AddKeyDialog({ isOpen, onOpenChange }: AddKeyDialogProps) {
  const form = useForm<z.infer<typeof keySchema>>({
    resolver: zodResolver(keySchema),
    defaultValues: {
      keyNumber: "",
      keyType: "Single",
      roomNumber: "",
      totalQuantity: 1,
    },
  });
  const createKeyMutation = useApiMutation<Key, Partial<Key>>(
    (newKey) => api('/api/keys', { method: 'POST', body: JSON.stringify(newKey) }),
    [['keys']]
  );
  const onSubmit = (values: z.infer<typeof keySchema>) => {
    createKeyMutation.mutate(values, {
      onSuccess: (data) => {
        toast.success(`Key "${data.keyNumber}" created successfully!`);
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(`Failed to create key: ${error.message}`);
      },
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Key</DialogTitle>
          <DialogDescription>
            Enter the details for the new key to add it to the inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="keyNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., M-101, S-205A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a key type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Sub-Master">Sub-Master</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room / Area</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Room 205, Building A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Zod will handle empty string validation, RHF needs a number
                        field.onChange(value === '' ? '' : parseInt(value, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createKeyMutation.isPending}>
                {createKeyMutation.isPending ? "Adding..." : "Add Key"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}