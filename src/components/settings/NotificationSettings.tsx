import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from '../ui/separator';
export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how you receive notifications from the system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="overdue-keys" className="flex flex-col space-y-1">
            <span>Overdue Keys</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Receive a notification when a key becomes overdue.
            </span>
          </Label>
          <Switch id="overdue-keys" defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Label htmlFor="key-returns" className="flex flex-col space-y-1">
            <span>Key Returns</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Get notified when a key is successfully returned.
            </span>
          </Label>
          <Switch id="key-returns" defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Label htmlFor="key-issues" className="flex flex-col space-y-1">
            <span>Key Issues</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Get notified when a key is issued to someone.
            </span>
          </Label>
          <Switch id="key-issues" />
        </div>
      </CardContent>
    </Card>
  );
}