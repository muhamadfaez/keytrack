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
  totalQuantity: number;
  availableQuantity: number;
}
export interface KeyAssignment {
  id: string;
  keyId: string;
  personnelId: string; // This ID now refers to a User
  issueDate: string; // ISO 8601 string
  assignmentType: "personal" | "event";
  dueDate?: string;   // ISO 8601 string
  returnDate?: string; // ISO 8601 string
}
// Represents an assignment populated with the full key and user objects.
export type PopulatedAssignment = Omit<KeyAssignment, 'personnelId'> & {
  key: Key;
  user: User;
  status: 'Issued' | 'Returned' | 'Overdue';
};
// Represents a key with its full assignment history.
export type KeyWithAssignments = Key & {
  assignments: PopulatedAssignment[];
};
// --- Key Request Types ---
export type KeyRequestStatus = "Pending" | "Approved" | "Rejected";
export interface KeyRequest {
  id: string;
  personnelId: string; // This ID now refers to a User
  requestedKeyInfo: string; // e.g., "Key for Room 101" or "Master Key"
  assignmentType: "personal" | "event";
  issueDate: string; // ISO 8601 string
  dueDate?: string;   // ISO 8601 string, optional for personal
  status: KeyRequestStatus;
  createdAt: string; // ISO 8601 string
}
export type PopulatedKeyRequest = Omit<KeyRequest, 'personnelId'> & {
  user: User;
};
// --- User Profile Type ---
export interface UserProfile {
  name: string;
  email: string;
  department: string;
  appLogoBase64?: string | null;
}
// --- User Authentication Types ---
export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  phone: string;
  role: 'admin' | 'user';
  password?: string; // Only on backend
}
export type AuthUser = Omit<User, 'password'>;
// --- Reporting Types ---
export type StatusDistributionItem = {
  name: 'Available' | 'Issued';
  value: number;
};
export type DepartmentActivityItem = {
  name: string;
  keys: number;
};
export type OverdueKeyInfo = {
  keyNumber: string;
  roomNumber: string;
  userName: string;
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