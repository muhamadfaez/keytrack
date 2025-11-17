import { Entity, IndexedEntity } from "./core-utils";
import type { Key, KeyAssignment, Notification, UserProfile, KeyRequest, User, Room } from "@shared/types";
// KEY ENTITY
export class KeyEntity extends IndexedEntity<Key> {
  static readonly entityName = "key";
  static readonly indexName = "keys";
  static readonly initialState: Key = {
    id: "",
    keyNumber: "",
    keyType: "Single",
    roomNumber: "",
    totalQuantity: 1,
    availableQuantity: 1,
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
    appName: "KeyTrack",
  };
}
// USER ENTITY
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: "",
    name: "",
    email: "",
    department: "",
    phone: "",
    password: "", // In a real app, this would be a hash
    role: "user",
    roomNumber: "",
  };
  static readonly seedData: ReadonlyArray<User> = [
    {
      id: "admin-seed",
      name: "Admin User",
      email: "admin@keytrack.app",
      department: "System Administration",
      phone: "123-456-7890",
      password: "password",
      role: "admin",
      roomNumber: "Admin Office",
    },
    {
      id: "iium-admin-seed",
      name: "Muhamad Faez",
      email: "muhamadfaez@iium.edu.my",
      department: "Kulliyyah of ICT",
      phone: "012-345-6789",
      password: "faez123",
      role: "admin",
      roomNumber: "KICT Building",
    },
  ];
}
// ROOM ENTITY
export class RoomEntity extends IndexedEntity<Room> {
  static readonly entityName = "room";
  static readonly indexName = "rooms";
  static readonly initialState: Room = {
    id: "",
    roomNumber: "",
    description: "",
  };
}