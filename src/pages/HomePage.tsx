import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { KeyAssignment, Personnel, Key } from "@shared/types";
import { format } from "date-fns";
const mockKeys: Key[] = [
  { id: 'k1', keyNumber: 'M-101', keyType: 'Master', roomNumber: 'Building A', status: 'Issued' },
  { id: 'k2', keyNumber: 'S-205', keyType: 'Single', roomNumber: '205', status: 'Available' },
  { id: 'k3', keyNumber: 'SM-3', keyType: 'Sub-Master', roomNumber: '3rd Floor', status: 'Overdue' },
];
const mockPersonnel: Personnel[] = [
  { id: 'p1', name: 'Alice Johnson', email: 'alice@university.edu', department: 'Facilities', phone: '123-456-7890' },
  { id: 'p2', name: 'Bob Williams', email: 'bob@university.edu', department: 'Science', phone: '123-456-7891' },
];
const mockAssignments: (KeyAssignment & { key: Key, personnel: Personnel })[] = [
  { id: 'a1', keyId: 'k1', personnelId: 'p1', issueDate: new Date(2023, 10, 15).toISOString(), dueDate: new Date(2024, 4, 15).toISOString(), key: mockKeys[0], personnel: mockPersonnel[0] },
  { id: 'a2', keyId: 'k3', personnelId: 'p2', issueDate: new Date(2024, 3, 1).toISOString(), dueDate: new Date(2024, 4, 1).toISOString(), key: mockKeys[2], personnel: mockPersonnel[1] },
];
export function HomePage() {
  const totalKeys = 1250;
  const keysIssued = 872;
  const keysAvailable = totalKeys - keysIssued;
  const overdueKeys = 43;
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Dashboard"
            subtitle="Welcome back! Here's a quick overview of your key management system."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Keys"
              value={totalKeys.toLocaleString()}
              icon={<KeyRound className="h-6 w-6 text-muted-foreground" />}
              description="Total number of keys in inventory"
            />
            <StatCard
              title="Keys Issued"
              value={keysIssued.toLocaleString()}
              icon={<Users className="h-6 w-6 text-muted-foreground" />}
              description={`${((keysIssued / totalKeys) * 100).toFixed(1)}% of total keys`}
            />
            <StatCard
              title="Keys Available"
              value={keysAvailable.toLocaleString()}
              icon={<CheckCircle className="h-6 w-6 text-muted-foreground" />}
              description="Keys ready for assignment"
            />
            <StatCard
              title="Overdue Keys"
              value={overdueKeys.toLocaleString()}
              icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
              description="Require immediate attention"
              variant="destructive"
            />
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
                    {mockAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.key.keyNumber}</TableCell>
                        <TableCell>{assignment.personnel.name}</TableCell>
                        <TableCell>{assignment.personnel.department}</TableCell>
                        <TableCell>{format(new Date(assignment.dueDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={assignment.key.status === 'Overdue' ? 'destructive' : 'secondary'}>
                            {assignment.key.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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