/**
 * Admin Type Definitions
 * Defines types for role and permission management
 */

/**
 * Permission categories for organizing permissions
 */
export enum PermissionCategory {
  USER_MANAGEMENT = 'User Management',
  PATIENT_MANAGEMENT = 'Patient Management',
  ENCOUNTER = 'Encounter',
  ORDERS = 'Orders',
  VITALS = 'Vitals',
  ASSESSMENTS = 'Assessments',
  NOTES = 'Notes',
  MEDICATIONS = 'Medications',
  LAB_RESULTS = 'Lab Results',
  IMAGING = 'Imaging',
  SCHEDULING = 'Scheduling',
  BILLING = 'Billing',
  REPORTS = 'Reports',
  SYSTEM_ADMINISTRATION = 'System Administration',
  ROLE_PERMISSION = 'Role & Permission Management',
}

/**
 * System permissions matching backend Permission enum
 */
export enum Permission {
  // User Management
  UsersView = 'UsersView',
  UsersCreate = 'UsersCreate',
  UsersEdit = 'UsersEdit',
  UsersDelete = 'UsersDelete',
  UsersAssignRoles = 'UsersAssignRoles',

  // Patient Management
  PatientsView = 'PatientsView',
  PatientsCreate = 'PatientsCreate',
  PatientsEdit = 'PatientsEdit',
  PatientsDelete = 'PatientsDelete',
  PatientsMerge = 'PatientsMerge',

  // Encounter
  EncountersView = 'EncountersView',
  EncountersCreate = 'EncountersCreate',
  EncountersEdit = 'EncountersEdit',
  EncountersClose = 'EncountersClose',

  // Orders
  OrdersView = 'OrdersView',
  OrdersCreate = 'OrdersCreate',
  OrdersSign = 'OrdersSign',
  OrdersCancel = 'OrdersCancel',

  // Vitals
  VitalsView = 'VitalsView',
  VitalsRecord = 'VitalsRecord',
  VitalsEdit = 'VitalsEdit',

  // Assessments
  AssessmentsView = 'AssessmentsView',
  AssessmentsCreate = 'AssessmentsCreate',
  AssessmentsEdit = 'AssessmentsEdit',

  // Clinical Notes
  NotesView = 'NotesView',
  NotesCreate = 'NotesCreate',
  NotesEdit = 'NotesEdit',
  NotesSign = 'NotesSign',
  NotesAddendum = 'NotesAddendum',

  // Medications
  MedicationsView = 'MedicationsView',
  MedicationsPrescribe = 'MedicationsPrescribe',
  MedicationsAdminister = 'MedicationsAdminister',
  MedicationsDispense = 'MedicationsDispense',

  // Lab Results
  LabResultsView = 'LabResultsView',
  LabResultsEnter = 'LabResultsEnter',
  LabResultsVerify = 'LabResultsVerify',

  // Imaging
  ImagingView = 'ImagingView',
  ImagingOrder = 'ImagingOrder',
  ImagingInterpret = 'ImagingInterpret',

  // Scheduling
  ScheduleView = 'ScheduleView',
  ScheduleManage = 'ScheduleManage',
  AppointmentsBook = 'AppointmentsBook',
  AppointmentsCancel = 'AppointmentsCancel',

  // Billing
  BillingView = 'BillingView',
  BillingCreate = 'BillingCreate',
  BillingEdit = 'BillingEdit',
  PaymentsProcess = 'PaymentsProcess',

  // Reports
  ReportsView = 'ReportsView',
  ReportsGenerate = 'ReportsGenerate',
  ReportsExport = 'ReportsExport',

  // System Administration
  SystemSettings = 'SystemSettings',
  AuditLogsView = 'AuditLogsView',
  SecuritySettings = 'SecuritySettings',

  // Role & Permission Management
  RolesView = 'RolesView',
  RolesCreate = 'RolesCreate',
  RolesEdit = 'RolesEdit',
  RolesDelete = 'RolesDelete',
  PermissionsView = 'PermissionsView',
  PermissionsAssign = 'PermissionsAssign',
}

/**
 * Permission data transfer object
 */
export interface PermissionDto {
  name: Permission;
  displayName: string;
  description: string;
  category: PermissionCategory;
}

/**
 * Role data transfer object
 */
export interface RoleDto {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isSystemRole: boolean;
  permissions: Permission[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request model for assigning permissions to a role
 */
export interface AssignPermissionsRequest {
  permissions: Permission[];
}

/**
 * User with role information for admin listing
 */
export interface AdminUserDto {
  id: string;
  email: string;
  name: string;
  roles: RoleDto[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

/**
 * Admin dashboard statistics
 */
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  recentLogins: number;
}
