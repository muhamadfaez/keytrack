import React, { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/useApi";
import { ReportSummary } from "@shared/types";
import { format } from "date-fns";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, FileDown, FileSpreadsheet } from "lucide-react";
import { exportToPdf, exportToExcel } from '@/lib/export';
import { toast } from 'sonner';
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null; // Don't render label for small slices
  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
      {`${payload.name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label || payload[0].name}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].value}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
export function ReportsPage() {
  const { data, isLoading, error } = useApi<ReportSummary>(['reports', 'summary']);
  const [chartColors, setChartColors] = useState<string[]>([]);
  useEffect(() => {
    // This effect runs on the client after mount, so `document` is available.
    const computedStyle = getComputedStyle(document.documentElement);
    const colors = [
      computedStyle.getPropertyValue('--chart-1').trim(),
      computedStyle.getPropertyValue('--chart-2').trim(),
      computedStyle.getPropertyValue('--chart-3').trim(),
      computedStyle.getPropertyValue('--chart-4').trim(),
      computedStyle.getPropertyValue('--chart-5').trim(),
    ];
    setChartColors(colors);
  }, []);
  const handleExportPdf = () => {
    if (data) {
      toast.info("Generating PDF report...");
      exportToPdf(data);
    }
  };
  const handleExportExcel = () => {
    if (data) {
      toast.info("Generating Excel report...");
      exportToExcel(data);
    }
  };
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center text-destructive py-12">
          <p>Failed to load reports: {error.message}</p>
        </div>
      );
    }
    if (!data) {
      return <div className="text-center text-muted-foreground py-12">No data available for reports.</div>;
    }
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Status Distribution</CardTitle>
            <CardDescription>Overview of all keys in the inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {data.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Keys Issued by Department</CardTitle>
            <CardDescription>Number of active key assignments per department.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.departmentActivity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Legend iconSize={10} />
                <Bar dataKey="keys" fill={chartColors[0]} name="Keys Issued" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
              Overdue Keys Report
            </CardTitle>
            <CardDescription>All keys that have passed their due date.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Number</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.overdueKeys.length > 0 ? (
                    data.overdueKeys.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.keyNumber}</TableCell>
                        <TableCell>{item.personName}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell className="text-destructive font-semibold">
                          {format(new Date(item.dueDate), "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No overdue keys. Great job!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Reports"
            subtitle="Analyze key inventory and assignment data."
          >
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExportPdf} disabled={isLoading || !data}>
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={handleExportExcel} disabled={isLoading || !data}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Excel
              </Button>
            </div>
          </PageHeader>
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
}