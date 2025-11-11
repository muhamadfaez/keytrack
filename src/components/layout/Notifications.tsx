import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Check } from "lucide-react";
import { useApi, useApiMutation } from '@/hooks/useApi';
import { Notification } from '@shared/types';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
export function Notifications() {
  const { data: notifications, isLoading, error } = useApi<Notification[]>(['notifications']);
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const markReadMutation = useApiMutation<{ success: boolean }, { ids: string[] }>(
    (payload) => api('/api/notifications/mark-read', { method: 'POST', body: JSON.stringify(payload) }),
    [['notifications']]
  );
  const handleMarkAllRead = () => {
    if (!notifications || unreadCount === 0) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    markReadMutation.mutate({ ids: unreadIds }, {
      onSuccess: () => {
        toast.info("All notifications marked as read.");
      },
      onError: (err) => {
        toast.error("Failed to mark notifications as read.", { description: err.message });
      }
    });
  };
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-2 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }
    if (error) {
      return <p className="p-4 text-sm text-destructive text-center">Failed to load notifications.</p>;
    }
    if (!notifications || notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <BellOff className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No Notifications</p>
          <p className="text-xs text-muted-foreground">You're all caught up!</p>
        </div>
      );
    }
    return notifications.map(notification => (
      <DropdownMenuItem key={notification.id} className="flex items-start gap-3">
        {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
        <div className={notification.read ? "pl-5" : ""}>
          <p className="text-sm font-medium leading-snug">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </p>
        </div>
      </DropdownMenuItem>
    ));
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {renderContent()}
        </div>
        {notifications && notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0 || markReadMutation.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}