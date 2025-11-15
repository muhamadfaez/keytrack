import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { KeyAssignment, Personnel, Key } from "@shared/types";
import { format } from "date-fns";
import { useApi } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
type DashboardStats = {
  totalKeys: number;
  keysIssued: number;
  keysAvailable: number;
  overdueKeys: number;
};
type PopulatedAssignment = KeyAssignment & {
  key: Key;
  personnel: Personnel;
};
export function HomePage() {
  const { data: stats, isLoading: isLoadingStats } = useApi<DashboardStats>(['stats']);
  const { data: recentAssignments, isLoading: isLoadingAssignments } = useApi<PopulatedAssignment[]>(['assignments', 'recent']);
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Dashboard"
            subtitle="Welcome back! Here's a quick overview of your key management system."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {isLoadingStats || !stats ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : (
              <>
                <StatCard
                  title="Total Keys"
                  value={stats.totalKeys.toLocaleString()}
                  icon={<KeyRound className="h-6 w-6 text-muted-foreground" />}
                  description="Total number of keys in inventory"
                />
                <StatCard
                  title="Keys Issued"
                  value={stats.keysIssued.toLocaleString()}
                  icon={<Users className="h-6 w-6 text-muted-foreground" />}
                  description={stats.totalKeys > 0 ? `${((stats.keysIssued / stats.totalKeys) * 100).toFixed(1)}% of total keys` : "N/A"}
                />
                <StatCard
                  title="Keys Available"
                  value={stats.keysAvailable.toLocaleString()}
                  icon={<CheckCircle className="h-6 w-6 text-muted-foreground" />}
                  description="Keys ready for assignment"
                />
                <StatCard
                  title="Overdue Keys"
                  value={stats.overdueKeys.toLocaleString()}
                  icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
                  description="Require immediate attention"
                  variant="destructive"
                />
              </>
            )}
          </div>
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key Number</TableHead>
                      <TableHead>Personnel</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingAssignments ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : recentAssignments && recentAssignments.length > 0 ? (
                      recentAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.key.keyNumber}</TableCell>
                          <TableCell>{assignment.personnel.name}</TableCell>
                          <TableCell>{assignment.personnel.department}</TableCell>
                          <TableCell>
                            {assignment.dueDate ? format(new Date(assignment.dueDate), "MMM dd, yyyy") : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={assignment.key.status === 'Overdue' ? 'destructive' : 'secondary'}>
                              {assignment.key.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No recent activity.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}