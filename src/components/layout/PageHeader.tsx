import React from 'react';
import { cn } from '@/lib/utils';
type PageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
};
export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-10", className)}>
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-foreground tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-lg text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">{children}</div>}
    </div>
  );
}