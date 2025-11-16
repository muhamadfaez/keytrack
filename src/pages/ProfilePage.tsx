import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";
import { useApi, useApiMutation } from '@/hooks/useApi';
import { UserProfile } from '@shared/types';
import { api } from '@/lib/api-client';
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
});
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
export function ProfilePage() {
  const { data: userProfile, isLoading, error } = useApi<UserProfile>(['profile']);
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
    },
  });
  useEffect(() => {
    if (userProfile) {
      form.reset(userProfile);
    }
  }, [userProfile, form]);
  const updateProfileMutation = useApiMutation<UserProfile, Partial<UserProfile>>(
    (updatedProfile) => api('/api/profile', { method: 'PUT', body: JSON.stringify(updatedProfile) }),
    [['profile']]
  );
  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(values, {
      onSuccess: (data) => {
        toast.success("Profile Updated", {
          description: "Your profile information has been saved.",
        });
        form.reset(data);
      },
      onError: (err) => {
        toast.error("Update Failed", {
          description: err.message,
        });
      },
    });
  };
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Password changes are not yet implemented.");
  };
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <PageHeader
              title="User Profile"
              subtitle="Manage your account details and security settings."
            />
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="md:col-span-2 space-y-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (error) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <PageHeader title="Error" subtitle="Could not load profile data." />
            <p className="text-destructive">{error.message}</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="User Profile"
            subtitle="Manage your account details and security settings."
          />
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
                    <AvatarFallback>{userProfile ? getInitials(userProfile.name) : 'AU'}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{userProfile?.name}</h3>
                  <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{userProfile?.department}</p>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2 space-y-8">
              <Card>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal details here.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@university.edu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input placeholder="Your department" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? "Saving..." : "Update Profile"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
              <Card>
                <form onSubmit={handlePasswordChange}>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Change your password here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" placeholder="••••••••" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Change Password</Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}