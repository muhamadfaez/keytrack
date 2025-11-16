import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Users, AlertTriangle, CheckCircle, ClipboardCheck } from "lucide-react";
import { PopulatedAssignment, PopulatedKeyRequest } from "@shared/types";
import { format } from "date-fns";
import { useApi } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
type DashboardStats = {
  totalKeys: number;
  keysIssued: number;
  keysAvailable: number;
  overdueKeys: number;
};
export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const isUserView = user?.role !== 'admin';
  const statsPath = isUserView ? `stats?userId=${user?.id}` : 'stats';
  const recentAssignmentsPath = isUserView ? `assignments/recent?userId=${user?.id}` : 'assignments/recent';
  const { data: stats, isLoading: isLoadingStats } = useApi<DashboardStats>([statsPath]);
  const { data: recentAssignments, isLoading: isLoadingAssignments } = useApi<PopulatedAssignment[]>([recentAssignmentsPath]);
  const { data: keyRequests, isLoading: isLoadingRequests } = useApi<PopulatedKeyRequest[]>(['requests'], { enabled: !isUserView });
  const pendingRequests = keyRequests?.filter(req => req.status === 'Pending').slice(0, 5) || [];
  const pageTitle = isUserView ? "My Dashboard" : "Dashboard";
  const pageSubtitle = isUserView
    ? "Here's an overview of your assigned keys."
    : "Welcome back! Here's a quick overview of your key management system.";
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <PageHeader
          title={pageTitle}
          subtitle={pageSubtitle}
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
                title={isUserView ? "Keys Held" : "Total Keys"}
                value={(stats.totalKeys ?? 0).toLocaleString()}
                icon={<KeyRound className="h-6 w-6 text-muted-foreground" />}
                description={isUserView ? "Total keys currently assigned to you" : "Total number of keys in inventory"}
              />
              <StatCard
                title={isUserView ? "Keys Issued" : "Keys Issued"}
                value={(stats.keysIssued ?? 0).toLocaleString()}
                icon={<Users className="h-6 w-6 text-muted-foreground" />}
                description={isUserView ? "Total keys assigned to you" : (stats.totalKeys ?? 0) > 0 ? `${(((stats.keysIssued ?? 0) / (stats.totalKeys ?? 0)) * 100).toFixed(1)}% of total keys` : "N/A"}
              />
              {!isUserView && (
                <StatCard
                  title="Keys Available"
                  value={(stats.keysAvailable ?? 0).toLocaleString()}
                  icon={<CheckCircle className="h-6 w-6 text-muted-foreground" />}
                  description="Keys ready for assignment"
                />
              )}
              <StatCard
                title="Overdue Keys"
                value={(stats.overdueKeys ?? 0).toLocaleString()}
                icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
                description={isUserView ? "Your keys that are overdue" : "Require immediate attention"}
                variant="destructive"
              />
            </>
          )}
        </div>
        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Number</TableHead>
                    <TableHead>User</TableHead>
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
                        <TableCell>{assignment.user.name}</TableCell>
                        <TableCell>{assignment.user.department}</TableCell>
                        <TableCell>
                          {assignment.dueDate ? format(new Date(assignment.dueDate), "MMM dd, yyyy") : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.status === 'Overdue' ? 'destructive' : 'secondary'}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No recent activity.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {!isUserView && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Key Requests</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/requests">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingRequests ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                  ) : pendingRequests.length > 0 ? (
                    pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center">
                        <ClipboardCheck className="h-5 w-5 text-muted-foreground mr-4" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{request.requestedKeyInfo}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested by {request.user.name}
                          </p>
                        </div>
                        <Badge variant="default">Pending</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No pending key requests.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}