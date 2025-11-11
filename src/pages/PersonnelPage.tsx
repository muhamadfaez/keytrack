import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Personnel } from "@shared/types";
const mockPersonnel: Personnel[] = [
  { id: 'p1', name: 'Alice Johnson', email: 'alice.j@university.edu', department: 'Facilities Management', phone: '(555) 123-4567' },
  { id: 'p2', name: 'Dr. Bob Williams', email: 'bob.w@university.edu', department: 'Physics Department', phone: '(555) 234-5678' },
  { id: 'p3', name: 'Charlie Brown', email: 'charlie.b@university.edu', department: 'Student Housing', phone: '(555) 345-6789' },
  { id: 'p4', name: 'Diana Prince', email: 'diana.p@university.edu', department: 'Athletics', phone: '(555) 456-7890' },
  { id: 'p5', name: 'Ethan Hunt', email: 'ethan.h@university.edu', department: 'Campus Security', phone: '(555) 567-8901' },
];
export function PersonnelPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <PageHeader
            title="Personnel"
            subtitle="Manage all faculty, staff, and contractors."
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Personnel
            </Button>
          </PageHeader>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Input placeholder="Search personnel..." className="max-w-sm" />
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPersonnel.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell>{person.department}</TableCell>
                        <TableCell>{person.email}</TableCell>
                        <TableCell>{person.phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}