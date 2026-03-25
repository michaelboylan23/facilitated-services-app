// ============================================
// Domain Types - Facilitated Services App
// ============================================

// --- Projects ---
export interface Project {
  Id: number;
  Title: string; // Project Number
  ProjectName: string;
  Client: string;
  ProjectStatus: string;
  SecondaryLogo?: string; // Data URL or path for client logo
}

// --- Assessments ---
export type AssessmentType =
  | "Construction Readiness"
  | "PDRI"
  | "Commissioning Readiness";

export type AssessmentStatus = "Draft" | "In Progress" | "Complete";

export interface Assessment {
  Id: number;
  Title: string;
  ProjectNumber: string;
  AssessmentType: AssessmentType;
  AssessmentDate: string;
  AssessmentStatus: AssessmentStatus;
  AssessmentScore?: number;
  FacilitatorName?: string;
  ProjectManagerName?: string;
}

// --- Master Question Categories ---
export interface QuestionCategory {
  Id: number;
  Title: string;
  AssessmentType: AssessmentType;
  CategoryDescription: string;
  CategoryWeight: number;
  CategoryOrder: number;
  Active: boolean;
}

// --- Master Question Bank ---
export interface QuestionBankItem {
  Id: number;
  Title: string;
  Question: string;
  AssessmentType: AssessmentType;
  CategoryId: number;
  DefaultQuestionScoreFactor: number;
  Active: boolean;
  AdditionalInformation?: string;
  // TODO: Add ResponseType column (numeric 0-5 vs yes/no) to SP list
}

// --- Assessment Categories (instance per assessment) ---
export interface AssessmentCategory {
  Id: number;
  Title: string;
  AssessmentId: number;
  CategoryId: number; // Master reference
  CategoryTargetScore?: number;
  CategoryActualScore?: number;
}

// --- Assessment Questions (instance per assessment) ---
export type QuestionStatus = "Unanswered" | "Answered" | "Ignored";
export type QuestionPriority = "High" | "Medium" | "Low";

export interface AssessmentQuestion {
  Id: number;
  Title: string;
  Question: string;
  AssessmentId: number;
  CategoryId: number; // Assessment Categories reference
  QuestionBankId: number; // Master reference
  QuestionScoreFactor: number;
  QuestionOrder: number;
  Active: boolean;
  AdditionalInformation?: string;
  Priority?: QuestionPriority;
  Status: QuestionStatus;
}

// --- Assessment Responses ---
export interface AssessmentResponse {
  Id: number;
  AssessmentId: number;
  QuestionId: number;
  CategoryId: number;
  Response: string;
  ResponseScore: number; // 0-5 (Yes=5, No=0)
  ResponseDate: string;
  Comments: string;
  Question?: string; // Denormalized question text
  AssessmentType?: AssessmentType;
}

// --- Assessment Attendees ---
export interface AssessmentAttendee {
  Id: number;
  AssessmentId: number;
  Attendee: string;
  Role: string;
  Company?: string;
  Email?: string;
}

// --- Assessment Actions ---
export type ActionStatus = "Open" | "In Progress" | "Complete" | "Closed";

export interface AssessmentAction {
  Id: number;
  AssessmentId: number;
  AssessmentName?: string;
  Action: string;
  ActionStatus: ActionStatus;
  TargetDate?: string;
  CompletedDate?: string;
  ResponsiblePartyId?: number; // Lookup to Attendees
  ResponsibleParty?: string; // Denormalized name
  Company?: string; // Lookup from Attendees
  Email?: string; // Lookup from Attendees
  Role?: string; // Lookup from Attendees
  QuestionId?: number; // Link to Assessment Question
}

// --- App Roles ---
export type AppRole = "admin" | "facilitator" | "user";

// --- Auth User ---
export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  role: AppRole;
  isAuthenticated: boolean;
}
