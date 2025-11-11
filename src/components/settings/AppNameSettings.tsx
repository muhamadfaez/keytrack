import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { UserProfile } from '@shared/types';
import { api } from '@/lib/api-client';
import { Building } from 'lucide-react';
const appNameSchema = z.object({
  appName: z.string().min(1, "Application name is required").max(50, "Name cannot exceed 50 characters"),
});
export function AppNameSettings() {
  const { data: userProfile, isLoading } = useApi<UserProfile>(['profile']);
  const form = useForm<z.infer<typeof appNameSchema>>({
    resolver: zodResolver(appNameSchema),
    defaultValues: {
      appName: '',
    },
  });
  useEffect(() => {
    if (userProfile) {
      form.reset({ appName: userProfile.appName || 'KeyTrack' });
    }
  }, [userProfile, form]);
  const updateProfileMutation = useApiMutation<UserProfile, Partial<UserProfile>>(
    (updatedProfile) => api('/api/profile', { method: 'PUT', body: JSON.stringify(updatedProfile) }),
    [['profile']]
  );
  const onSubmit = (values: z.infer<typeof appNameSchema>) => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, ...values };
    updateProfileMutation.mutate(updatedProfile, {
      onSuccess: (data) => {
        toast.success('Application name updated successfully!');
        form.reset({ appName: data.appName });
      },
      onError: (error) => {
        toast.error('Failed to update name', { description: error.message });
      }
    });
  };
  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              Application Name
            </CardTitle>
            <CardDescription>
              Set the name that appears throughout the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., KeyTrack" {...field} disabled={isLoading || updateProfileMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || updateProfileMutation.isPending || !form.formState.isDirty}>
              {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}