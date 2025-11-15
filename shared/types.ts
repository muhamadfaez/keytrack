export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type KeyStatus = "Available" | "Issued" | "Overdue" | "Lost";
export interface Key {
  id: string;
  keyNumber: string;
  keyType: string; // e.g., 'Master', 'Sub-Master', 'Single'
  roomNumber: string;
  status: KeyStatus;
  currentHolderId?: string;
}
export interface Personnel {
  id: string;
  name: string;
  email: string;
  department: string;
  phone: string;
}
export interface KeyAssignment {
  id: string;
  keyId: string;
  personnelId: string;
  issueDate: string; // ISO 8601 string
  assignmentType: "personal" | "event";
  dueDate?: string;   // ISO 8601 string
  returnDate?: string; // ISO 8601 string
}
// Represents an assignment populated with the full key and personnel objects.
export type PopulatedAssignment = KeyAssignment & {
  key: Key;
  personnel: Personnel;
};
// Represents a key with its full assignment history.
export type KeyWithAssignments = Key & {
  assignments: PopulatedAssignment[];
};
// --- Reporting Types ---
export type StatusDistributionItem = {
  name: KeyStatus;
  value: number;
};
export type DepartmentActivityItem = {
  name: string;
  keys: number;
};
export type OverdueKeyInfo = {
  keyNumber: string;
  roomNumber: string;
  personName: string;
  department: string;
  dueDate: string;
};
export type ReportSummary = {
  statusDistribution: StatusDistributionItem[];
  departmentActivity: DepartmentActivityItem[];
  overdueKeys: OverdueKeyInfo[];
};
// --- Notification Type ---
export interface Notification {
  id: string;
  message: string;
  timestamp: string; // ISO 8601 string
  read: boolean;
}