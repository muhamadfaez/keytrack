import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
type StatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  variant?: 'default' | 'destructive';
};
export function StatCard({ title, value, icon, description, variant = 'default' }: StatCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", variant === 'destructive' && 'text-red-500')}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}