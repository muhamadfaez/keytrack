import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from '../ui/separator';
import { useSettingsStore } from '@/stores/settingsStore';
export function NotificationSettings() {
  const overdueKeys = useSettingsStore((state) => state.notifications.overdueKeys);
  const keyReturns = useSettingsStore((state) => state.notifications.keyReturns);
  const keyIssues = useSettingsStore((state) => state.notifications.keyIssues);
  const toggleOverdueKeys = useSettingsStore((state) => state.toggleOverdueKeys);
  const toggleKeyReturns = useSettingsStore((state) => state.toggleKeyReturns);
  const toggleKeyIssues = useSettingsStore((state) => state.toggleKeyIssues);
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
          <Label htmlFor="overdue-keys" className="flex flex-col space-y-1 cursor-pointer">
            <span>Overdue Keys</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Receive a notification when a key becomes overdue.
            </span>
          </Label>
          <Switch
            id="overdue-keys"
            checked={overdueKeys}
            onCheckedChange={toggleOverdueKeys}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Label htmlFor="key-returns" className="flex flex-col space-y-1 cursor-pointer">
            <span>Key Returns</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Get notified when a key is successfully returned.
            </span>
          </Label>
          <Switch
            id="key-returns"
            checked={keyReturns}
            onCheckedChange={toggleKeyReturns}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Label htmlFor="key-issues" className="flex flex-col space-y-1 cursor-pointer">
            <span>Key Issues</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Get notified when a key is issued to someone.
            </span>
          </Label>
          <Switch
            id="key-issues"
            checked={keyIssues}
            onCheckedChange={toggleKeyIssues}
          />
        </div>
      </CardContent>
    </Card>
  );
}