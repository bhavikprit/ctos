// Transfer statuses
export type TransferStatus =
  | "PLANNED"
  | "AWAITING_CHECKLIST"
  | "READY"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETING"
  | "PENDING_CLOSURE"
  | "COMPLETED"
  | "TERMINATED";

// Transfer types
export type TransferType =
  | "SHIP_TO_TANK"
  | "TANK_TO_SHIP"
  | "TANK_TO_TANK"
  | "TANK_TO_TRUCK"
  | "TANK_TO_IBC"
  | "CROSS_TERMINAL"
  | "IBC_TO_TRUCK";

// User roles
export type UserRole =
  | "ADMIN"
  | "TERMINAL_MANAGER"
  | "OPERATIONS_MANAGER"
  | "PLANNER"
  | "FIELD_OPERATOR"
  | "VIEWER";

// Tank statuses
export type TankStatus =
  | "AVAILABLE"
  | "ALLOCATED"
  | "IN_USE"
  | "CLEANING"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE";

// Vessel call statuses
export type VesselCallStatus =
  | "SCHEDULED"
  | "ARRIVED"
  | "BERTHED"
  | "OPERATIONS"
  | "COMPLETED"
  | "DEPARTED";

// Event types
export type EventType =
  | "TRANSFER_CREATED"
  | "TRANSFER_STARTED"
  | "TRANSFER_PAUSED"
  | "TRANSFER_RESUMED"
  | "TRANSFER_COMPLETED"
  | "TRANSFER_TERMINATED"
  | "FLOW_RATE_CHANGE"
  | "ULLAGE_READING"
  | "SHIP_FIGURE_RECORDED"
  | "ALARM_TRIGGERED"
  | "ALARM_ACKNOWLEDGED"
  | "VALVE_CHANGE"
  | "DOCUMENT_UPLOADED"
  | "CHECKLIST_COMPLETED"
  | "CHECKLIST_SIGNED"
  | "CERTIFICATE_GENERATED"
  | "CERTIFICATE_SIGNED"
  | "VARIANCE_ALERT"
  | "EMERGENCY_STOP"
  | "ROUTE_CONFIRMED"
  | "COMMUNICATION";

// Valid state transitions
export const VALID_TRANSITIONS: Record<TransferStatus, TransferStatus[]> = {
  PLANNED: ["AWAITING_CHECKLIST"],
  AWAITING_CHECKLIST: ["READY"],
  READY: ["IN_PROGRESS"],
  IN_PROGRESS: ["PAUSED", "COMPLETING"],
  PAUSED: ["IN_PROGRESS", "TERMINATED"],
  COMPLETING: ["PENDING_CLOSURE"],
  PENDING_CLOSURE: ["COMPLETED"],
  COMPLETED: [],
  TERMINATED: [],
};
