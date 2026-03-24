// ============================================
// Domain Types - Facilitated Services App
// ============================================

// --- Projects ---
export interface Project {
  Id: number;
  Title: string; // Project Number
  ProjectName: string;
  Client: string;
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
export interface AssessmentQuestion {
  Id: number;
  Title: string;
  Question: string;
  AssessmentId: number;
  CategoryId: number; // Assessment Categories reference
  QuestionBankId: number; // Master reference
  QuestionScoreFactor: number;
  Active: boolean;
}

// --- Assessment Responses ---
export interface AssessmentResponse {
  Id: number;
  AssessmentId: number;
  QuestionId: number;
  CategoryId: number;
  Response: string;
  ResponseScore: number; // 0-5
  ResponseDate: string;
  Comments: string;
}

// --- Assessment Attendees ---
export interface AssessmentAttendee {
  Id: number;
  AssessmentId: number;
  Attendee: string;
  Role: string;
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
