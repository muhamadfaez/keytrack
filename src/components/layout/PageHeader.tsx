import React from 'react';
type PageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};
export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-10">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground tracking-tight">
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