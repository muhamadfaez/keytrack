import { IndexedEntity } from "./core-utils";
import type { Key, Personnel, KeyAssignment, Notification } from "@shared/types";
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