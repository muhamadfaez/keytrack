import { Entity, IndexedEntity } from "./core-utils";
import type { Key, Personnel, KeyAssignment, Notification, UserProfile, KeyRequest } from "@shared/types";
// KEY ENTITY
export class KeyEntity extends IndexedEntity<Key> {
  static readonly entityName = "key";
  static readonly indexName = "keys";
  static readonly initialState: Key = {
    id: "",
    keyNumber: "",
    keyType: "Single",
    roomNumber: "",
    status: "Available",
  };
}
// PERSONNEL ENTITY
export class PersonnelEntity extends IndexedEntity<Personnel> {
  static readonly entityName = "personnel";
  static readonly indexName = "personnel";
  static readonly initialState: Personnel = {
    id: "",
    name: "",
    email: "",
    department: "",
    phone: "",
  };
}
// KEY ASSIGNMENT ENTITY
export class KeyAssignmentEntity extends IndexedEntity<KeyAssignment> {
  static readonly entityName = "keyAssignment";
  static readonly indexName = "keyAssignments";
  static readonly initialState: KeyAssignment = {
    id: "",
    keyId: "",
    personnelId: "",
    issueDate: "",
    assignmentType: "event",
  };
}
// KEY REQUEST ENTITY
export class KeyRequestEntity extends IndexedEntity<KeyRequest> {
  static readonly entityName = "keyRequest";
  static readonly indexName = "keyRequests";
  static readonly initialState: KeyRequest = {
    id: "",
    personnelId: "",
    requestedKeyInfo: "",
    assignmentType: "event",
    issueDate: "",
    status: "Pending",
    createdAt: "",
  };
}
// NOTIFICATION ENTITY
export class NotificationEntity extends IndexedEntity<Notification> {
  static readonly entityName = "notification";
  static readonly indexName = "notifications";
  static readonly initialState: Notification = {
    id: "",
    message: "",
    timestamp: "",
    read: false,
  };
}
// USER PROFILE ENTITY
export class UserProfileEntity extends Entity<UserProfile> {
  static readonly entityName = "userProfile";
  static readonly initialState: UserProfile = {
    name: "Admin User",
    email: "admin@university.edu",
    department: "IT Services",
    appLogoBase64: null,
  };
}