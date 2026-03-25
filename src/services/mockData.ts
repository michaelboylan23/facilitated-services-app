import type {
  Project,
  Assessment,
  QuestionCategory,
  QuestionBankItem,
  AssessmentCategory,
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentAttendee,
  AssessmentAction,
  AssessmentType,
} from "../types";

// ============================================
// Local Storage Keys
// ============================================
const KEYS = {
  projects: "fs_projects",
  assessments: "fs_assessments",
  questionCategories: "fs_question_categories",
  questionBank: "fs_question_bank",
  assessmentCategories: "fs_assessment_categories",
  assessmentQuestions: "fs_assessment_questions",
  assessmentResponses: "fs_assessment_responses",
  assessmentAttendees: "fs_assessment_attendees",
  assessmentActions: "fs_assessment_actions",
  nextId: "fs_next_id",
} as const;

// ============================================
// ID Generator
// ============================================
function getNextId(): number {
  const current = parseInt(localStorage.getItem(KEYS.nextId) || "100", 10);
  localStorage.setItem(KEYS.nextId, String(current + 1));
  return current;
}

// ============================================
// Generic Helpers
// ============================================
function getAll<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function saveAll<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// ============================================
// Seed Data — only runs if localStorage is empty
// ============================================
export function seedMockData(): void {
  if (localStorage.getItem(KEYS.projects)) return; // already seeded

  const projects: Project[] = [
    { Id: 1, Title: "PRJ-001", ProjectName: "Highway 50 Bridge Replacement", Client: "VDOT", ProjectStatus: "Active" },
    { Id: 2, Title: "PRJ-002", ProjectName: "Metro Station Expansion", Client: "WMATA", ProjectStatus: "Active" },
    { Id: 3, Title: "PRJ-003", ProjectName: "Water Treatment Plant Upgrade", Client: "DC Water", ProjectStatus: "Planning" },
  ];

  const questionCategories: QuestionCategory[] = [
    // Construction Readiness
    { Id: 10, Title: "Site Readiness", AssessmentType: "Construction Readiness", CategoryDescription: "Physical site conditions and access", CategoryWeight: 20, CategoryOrder: 1, Active: true },
    { Id: 11, Title: "Design Completeness", AssessmentType: "Construction Readiness", CategoryDescription: "Design documents and specifications", CategoryWeight: 25, CategoryOrder: 2, Active: true },
    { Id: 12, Title: "Procurement Status", AssessmentType: "Construction Readiness", CategoryDescription: "Materials and equipment procurement", CategoryWeight: 20, CategoryOrder: 3, Active: true },
    { Id: 13, Title: "Permitting & Approvals", AssessmentType: "Construction Readiness", CategoryDescription: "Regulatory permits and approvals", CategoryWeight: 15, CategoryOrder: 4, Active: true },
    { Id: 14, Title: "Staffing & Resources", AssessmentType: "Construction Readiness", CategoryDescription: "Workforce and resource availability", CategoryWeight: 20, CategoryOrder: 5, Active: true },
    // PDRI
    { Id: 20, Title: "Basis of Project Decision", AssessmentType: "PDRI", CategoryDescription: "Project objectives and requirements", CategoryWeight: 30, CategoryOrder: 1, Active: true },
    { Id: 21, Title: "Basis of Design", AssessmentType: "PDRI", CategoryDescription: "Design parameters and criteria", CategoryWeight: 40, CategoryOrder: 2, Active: true },
    { Id: 22, Title: "Execution Approach", AssessmentType: "PDRI", CategoryDescription: "Project execution planning", CategoryWeight: 30, CategoryOrder: 3, Active: true },
    // Commissioning Readiness
    { Id: 30, Title: "Systems Documentation", AssessmentType: "Commissioning Readiness", CategoryDescription: "System documentation completeness", CategoryWeight: 25, CategoryOrder: 1, Active: true },
    { Id: 31, Title: "Testing Procedures", AssessmentType: "Commissioning Readiness", CategoryDescription: "Test plans and procedures", CategoryWeight: 30, CategoryOrder: 2, Active: true },
    { Id: 32, Title: "Turnover Readiness", AssessmentType: "Commissioning Readiness", CategoryDescription: "Readiness for system turnover", CategoryWeight: 25, CategoryOrder: 3, Active: true },
    { Id: 33, Title: "Training & Operations", AssessmentType: "Commissioning Readiness", CategoryDescription: "Operations training and readiness", CategoryWeight: 20, CategoryOrder: 4, Active: true },
  ];

  const questionBank: QuestionBankItem[] = [
    // Construction Readiness - Site Readiness
    { Id: 100, Title: "Site Access", Question: "Is site access established and adequate for construction vehicles?", AssessmentType: "Construction Readiness", CategoryId: 10, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 101, Title: "Utilities Located", Question: "Have all underground utilities been located and marked?", AssessmentType: "Construction Readiness", CategoryId: 10, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 102, Title: "Environmental Clearance", Question: "Have environmental clearances been obtained?", AssessmentType: "Construction Readiness", CategoryId: 10, DefaultQuestionScoreFactor: 1, Active: true },
    // Construction Readiness - Design Completeness
    { Id: 103, Title: "Design Documents", Question: "Are construction drawings at 100% completion?", AssessmentType: "Construction Readiness", CategoryId: 11, DefaultQuestionScoreFactor: 1.5, Active: true },
    { Id: 104, Title: "Specifications", Question: "Are technical specifications complete and approved?", AssessmentType: "Construction Readiness", CategoryId: 11, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 105, Title: "RFI Resolution", Question: "Are all design RFIs resolved?", AssessmentType: "Construction Readiness", CategoryId: 11, DefaultQuestionScoreFactor: 1, Active: true },
    // Construction Readiness - Procurement
    { Id: 106, Title: "Long-Lead Items", Question: "Have all long-lead items been ordered and delivery confirmed?", AssessmentType: "Construction Readiness", CategoryId: 12, DefaultQuestionScoreFactor: 1.5, Active: true },
    { Id: 107, Title: "Material Availability", Question: "Are critical materials available or on confirmed delivery schedule?", AssessmentType: "Construction Readiness", CategoryId: 12, DefaultQuestionScoreFactor: 1, Active: true },
    // Construction Readiness - Permitting
    { Id: 108, Title: "Building Permits", Question: "Have all required building permits been obtained?", AssessmentType: "Construction Readiness", CategoryId: 13, DefaultQuestionScoreFactor: 1.5, Active: true },
    { Id: 109, Title: "Environmental Permits", Question: "Are environmental permits in place and conditions understood?", AssessmentType: "Construction Readiness", CategoryId: 13, DefaultQuestionScoreFactor: 1, Active: true },
    // Construction Readiness - Staffing
    { Id: 110, Title: "Key Personnel", Question: "Are key project personnel identified and available?", AssessmentType: "Construction Readiness", CategoryId: 14, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 111, Title: "Subcontractor Readiness", Question: "Are subcontractors mobilized and ready?", AssessmentType: "Construction Readiness", CategoryId: 14, DefaultQuestionScoreFactor: 1, Active: true },
    // PDRI - Basis of Project Decision
    { Id: 200, Title: "Project Objectives", Question: "Are project objectives clearly defined and documented?", AssessmentType: "PDRI", CategoryId: 20, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 201, Title: "Success Criteria", Question: "Have measurable success criteria been established?", AssessmentType: "PDRI", CategoryId: 20, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 202, Title: "Business Case", Question: "Is the business case documented and approved?", AssessmentType: "PDRI", CategoryId: 20, DefaultQuestionScoreFactor: 1, Active: true },
    // PDRI - Basis of Design
    { Id: 203, Title: "Design Criteria", Question: "Are design criteria and standards defined?", AssessmentType: "PDRI", CategoryId: 21, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 204, Title: "Site Data", Question: "Is site survey and geotechnical data available?", AssessmentType: "PDRI", CategoryId: 21, DefaultQuestionScoreFactor: 1, Active: true },
    // PDRI - Execution Approach
    { Id: 205, Title: "Execution Plan", Question: "Is the project execution plan developed?", AssessmentType: "PDRI", CategoryId: 22, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 206, Title: "Schedule", Question: "Is a realistic project schedule established?", AssessmentType: "PDRI", CategoryId: 22, DefaultQuestionScoreFactor: 1, Active: true },
    // Commissioning Readiness
    { Id: 300, Title: "System Boundaries", Question: "Are system boundaries clearly defined?", AssessmentType: "Commissioning Readiness", CategoryId: 30, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 301, Title: "O&M Manuals", Question: "Are O&M manuals complete and available?", AssessmentType: "Commissioning Readiness", CategoryId: 30, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 302, Title: "Test Plans", Question: "Are functional test plans developed and approved?", AssessmentType: "Commissioning Readiness", CategoryId: 31, DefaultQuestionScoreFactor: 1.5, Active: true },
    { Id: 303, Title: "Pre-Functional Tests", Question: "Have pre-functional checklists been completed?", AssessmentType: "Commissioning Readiness", CategoryId: 31, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 304, Title: "Punch List", Question: "Is the construction punch list substantially complete?", AssessmentType: "Commissioning Readiness", CategoryId: 32, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 305, Title: "Spare Parts", Question: "Are spare parts and maintenance materials on hand?", AssessmentType: "Commissioning Readiness", CategoryId: 32, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 306, Title: "Training Complete", Question: "Has operator training been completed?", AssessmentType: "Commissioning Readiness", CategoryId: 33, DefaultQuestionScoreFactor: 1, Active: true },
    { Id: 307, Title: "SOPs", Question: "Are standard operating procedures finalized?", AssessmentType: "Commissioning Readiness", CategoryId: 33, DefaultQuestionScoreFactor: 1, Active: true },
  ];

  const assessments: Assessment[] = [
    { Id: 50, Title: "PRJ-001 Construction Readiness #1", ProjectNumber: "PRJ-001", AssessmentType: "Construction Readiness", AssessmentDate: "2026-03-15", AssessmentStatus: "In Progress", FacilitatorName: "Michael Boylan", ProjectManagerName: "John Smith" },
    { Id: 51, Title: "PRJ-002 PDRI Assessment", ProjectNumber: "PRJ-002", AssessmentType: "PDRI", AssessmentDate: "2026-03-10", AssessmentStatus: "Draft", FacilitatorName: "Michael Boylan", ProjectManagerName: "Jane Doe" },
  ];

  saveAll(KEYS.projects, projects);
  saveAll(KEYS.assessments, assessments);
  saveAll(KEYS.questionCategories, questionCategories);
  saveAll(KEYS.questionBank, questionBank);
  saveAll(KEYS.assessmentCategories, []);
  saveAll(KEYS.assessmentQuestions, []);
  saveAll(KEYS.assessmentResponses, []);
  saveAll(KEYS.assessmentAttendees, []);
  saveAll(KEYS.assessmentActions, []);
  localStorage.setItem(KEYS.nextId, "400");
}

// ============================================
// Projects
// ============================================
export function getProjects(): Project[] {
  return getAll<Project>(KEYS.projects);
}

export function getProject(id: number): Project | undefined {
  return getProjects().find((p) => p.Id === id);
}

export function getProjectByNumber(projectNumber: string): Project | undefined {
  return getProjects().find((p) => p.Title === projectNumber);
}

export function createProject(data: Omit<Project, "Id">): Project {
  const items = getProjects();
  const newItem: Project = { ...data, Id: getNextId() };
  items.push(newItem);
  saveAll(KEYS.projects, items);
  return newItem;
}

export function updateProject(id: number, updates: Partial<Project>): Project | undefined {
  const items = getProjects();
  const idx = items.findIndex((p) => p.Id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  saveAll(KEYS.projects, items);
  return items[idx];
}

export function deleteProject(id: number): boolean {
  const items = getProjects();
  const filtered = items.filter((p) => p.Id !== id);
  if (filtered.length === items.length) return false;
  saveAll(KEYS.projects, filtered);
  return true;
}

// ============================================
// Assessments
// ============================================
export function getAssessments(): Assessment[] {
  return getAll<Assessment>(KEYS.assessments);
}

export function getAssessment(id: number): Assessment | undefined {
  return getAssessments().find((a) => a.Id === id);
}

export function getAssessmentsByProject(projectNumber: string): Assessment[] {
  return getAssessments().filter((a) => a.ProjectNumber === projectNumber);
}

export function createAssessment(data: Omit<Assessment, "Id">): Assessment {
  const items = getAssessments();
  const newItem: Assessment = { ...data, Id: getNextId() };
  items.push(newItem);
  saveAll(KEYS.assessments, items);
  return newItem;
}

export function updateAssessment(id: number, updates: Partial<Assessment>): Assessment | undefined {
  const items = getAssessments();
  const idx = items.findIndex((a) => a.Id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  saveAll(KEYS.assessments, items);
  return items[idx];
}

export function deleteAssessment(id: number): boolean {
  const items = getAssessments();
  const filtered = items.filter((a) => a.Id !== id);
  if (filtered.length === items.length) return false;
  saveAll(KEYS.assessments, filtered);
  return true;
}

// ============================================
// Question Categories (Master)
// ============================================
export function getQuestionCategories(assessmentType?: AssessmentType): QuestionCategory[] {
  const all = getAll<QuestionCategory>(KEYS.questionCategories);
  if (!assessmentType) return all;
  return all.filter((c) => c.AssessmentType === assessmentType && c.Active).sort((a, b) => a.CategoryOrder - b.CategoryOrder);
}

export function getQuestionCategory(id: number): QuestionCategory | undefined {
  return getAll<QuestionCategory>(KEYS.questionCategories).find((c) => c.Id === id);
}

export function createQuestionCategory(data: Omit<QuestionCategory, "Id">): QuestionCategory {
  const items = getAll<QuestionCategory>(KEYS.questionCategories);
  const newItem: QuestionCategory = { ...data, Id: getNextId() };
  items.push(newItem);
  saveAll(KEYS.questionCategories, items);
  return newItem;
}

export function updateQuestionCategory(id: number, updates: Partial<QuestionCategory>): QuestionCategory | undefined {
  const items = getAll<QuestionCategory>(KEYS.questionCategories);
  const idx = items.findIndex((c) => c.Id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  saveAll(KEYS.questionCategories, items);
  return items[idx];
}

export function deleteQuestionCategory(id: number): boolean {
  const items = getAll<QuestionCategory>(KEYS.questionCategories);
  const filtered = items.filter((c) => c.Id !== id);
  if (filtered.length === items.length) return false;
  saveAll(KEYS.questionCategories, filtered);
  return true;
}

// ============================================
// Question Bank (Master)
// ============================================
export function getQuestionBank(assessmentType?: AssessmentType): QuestionBankItem[] {
  const all = getAll<QuestionBankItem>(KEYS.questionBank);
  if (!assessmentType) return all;
  return all.filter((q) => q.AssessmentType === assessmentType && q.Active);
}

export function getQuestionBankItem(id: number): QuestionBankItem | undefined {
  return getAll<QuestionBankItem>(KEYS.questionBank).find((q) => q.Id === id);
}

export function createQuestionBankItem(data: Omit<QuestionBankItem, "Id">): QuestionBankItem {
  const items = getAll<QuestionBankItem>(KEYS.questionBank);
  const newItem: QuestionBankItem = { ...data, Id: getNextId() };
  items.push(newItem);
  saveAll(KEYS.questionBank, items);
  return newItem;
}

export function updateQuestionBankItem(id: number, updates: Partial<QuestionBankItem>): QuestionBankItem | undefined {
  const items = getAll<QuestionBankItem>(KEYS.questionBank);
  const idx = items.findIndex((q) => q.Id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  saveAll(KEYS.questionBank, items);
  return items[idx];
}

export function deleteQuestionBankItem(id: number): boolean {
  const items = getAll<QuestionBankItem>(KEYS.questionBank);
  const filtered = items.filter((q) => q.Id !== id);
  if (filtered.length === items.length) return false;
  saveAll(KEYS.questionBank, filtered);
  return true;
}

// ============================================
// Assessment Categories (Instance)
// ============================================
export function getAssessmentCategories(assessmentId?: number): AssessmentCategory[] {
  const all = getAll<AssessmentCategory>(KEYS.assessmentCategories);
  if (assessmentId === undefined) return all;
  return all.filter((c) => c.AssessmentId === assessmentId);
}

export function getAssessmentCategory(id: number): AssessmentCategory | undefined {
  return getAll<AssessmentCategory>(KEYS.assessmentCategories).find((c) => c.Id === id);
}

export function createAssessmentCategory(data: Omit<AssessmentCategory, "Id">): AssessmentCategory {
  const items = getAll<AssessmentCategory>(KEYS.assessmentCategories);
  const newItem: AssessmentCategory = { ...data, Id: getNextId() };
  items.push(newItem);
  saveAll(KEYS.assessmentCategories, items);
  return newItem;
}

export function updateAssessmentCategory(id: number, updates: Partial<AssessmentCategory>): AssessmentCategory | undefined {
  const items = getAll<AssessmentCategory>(KEYS.assessmentCategories);
  const idx = items.findIndex((c) => c.Id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  saveAll(KEYS.assessmentCategories, items);
  return items[idx];
}

// ============================================
// Assessment Questions (Instance)
// ============================================
export function getAssessmentQuestions(assessmentId?: number): AssessmentQuestion[] {
  const all = getAll<AssessmentQuestion>(KEYS.assessmentQuestions);
  if (assessmentId === undefined) return all;
  return all.filter((q) => q.AssessmentId === assessmentId).sort((a, b) => a.QuestionOrder - b.QuestionOrder);
}

export function getAssessmentQuestion(id: number): AssessmentQuestion | undefined {
  return getAll<AssessmentQuestion>(KEYS.assessmentQuestions).find((q) => q.Id === id);
}

export function createAssessmentQuestion(data: Omit<AssessmentQuestion, "Id">): AssessmentQuestion {
  const items = getAll<AssessmentQuestion>(KEYS.assessmentQuestions);
  const newItem: AssessmentQuestion = { ...data, Id: getNextId() };
  items.push(newItem);
  saveAll(KEYS.assessmentQuestions, items);
  return newItem;
}

export function updateAssessmentQuestion(id: number, updates: Partial<AssessmentQuestion>): AssessmentQuestion | undefined {
  const items = getAll<AssessmentQuestion>(KEYS.assessmentQuestions);
  const idx = items.findIndex((q) => q.Id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  saveAll(KEYS.assessmentQuestions, items);
  return items[idx];
}

// ============================================
// Assessment Responses
// ============================================
export function getAssessmentResponses(assessmentId?: number): AssessmentResponse[] {
  const all = getAll<AssessmentResponse>(KEYS.assessmentResponses);
  if (assessmentId === undefined) return all;
  return all.filter((r) => r.AssessmentId === assessmentId);
}

export function getResponseByQuestion(questionId: number): AssessmentResponse | undefined {
  return getAll<AssessmentResponse>(KEYS.assessmentResponses).find((r) => r.QuestionId === questionId);
}

export function saveResponse(data: Omit<AssessmentResponse, "Id">): AssessmentResponse {
  const items = getAll<AssessmentResponse>(KEYS.assessmentResponses);
  const newItem: AssessmentResponse = { ...data, Id: getNextId() };
  items.push(newItem);
  saveAll(KEYS.assessmentResponses, items);
  return newItem;
}

export function updateResponse(id: number, updates: Partial<AssessmentResponse>): AssessmentResponse | undefined {
  const items = getAll<AssessmentResponse>(KEYS.assessmentResponses);
  const idx = items.findIndex((r) => r.Id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  saveAll(KEYS.assessmentResponses, items);
  return items[idx];
}

export function upsertResponse(questionId: number, data: Omit<AssessmentResponse, "Id">): AssessmentResponse {
  const existing = getResponseByQuestion(questionId);
  if (existing) {
    return updateResponse(existing.Id, data)!;
  }
  return saveResponse(data);
}

// ============================================
// Assessment Attendees
// ============================================
export function getAssessmentAttendees(assessmentId?: number): AssessmentAttendee[] {
  const all = getAll<AssessmentAttendee>(KEYS.assessmentAttendees);
  if (assessmentId === undefined) return all;
  return all.filter((a) => a.AssessmentId === assessmentId);
}

export function getAssessmentAttendee(id: number): AssessmentAttendee | undefined {
  return getAll<AssessmentAttendee>(KEYS.assessmentAttendees).find((a) => a.Id === id);
}

export function addAttendee(data: Omit<AssessmentAttendee, "Id">): AssessmentAttendee {
  const items = getAll<AssessmentAttendee>(KEYS.assessmentAttendees);
  const newItem: AssessmentAttendee = { ...data, Id: getNextId() };
  items.push(newItem);
  saveAll(KEYS.assessmentAttendees, items);
  return newItem;
}

export function updateAttendee(id: number, updates: Partial<AssessmentAttendee>): AssessmentAttendee | undefined {
  const items = getAll<AssessmentAttendee>(KEYS.assessmentAttendees);
  const idx = items.findIndex((a) => a.Id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  saveAll(KEYS.assessmentAttendees, items);
  return items[idx];
}

export function deleteAttendee(id: number): boolean {
  const items = getAll<AssessmentAttendee>(KEYS.assessmentAttendees);
  const filtered = items.filter((a) => a.Id !== id);
  if (filtered.length === items.length) return false;
  saveAll(KEYS.assessmentAttendees, filtered);
  return true;
}

// ============================================
// Assessment Actions
// ============================================
export function getAssessmentActions(assessmentId?: number): AssessmentAction[] {
  const all = getAll<AssessmentAction>(KEYS.assessmentActions);
  if (assessmentId === undefined) return all;
  return all.filter((a) => a.AssessmentId === assessmentId);
}

export function getAssessmentAction(id: number): AssessmentAction | undefined {
  return getAll<AssessmentAction>(KEYS.assessmentActions).find((a) => a.Id === id);
}

export function createAction(data: Omit<AssessmentAction, "Id">): AssessmentAction {
  const items = getAll<AssessmentAction>(KEYS.assessmentActions);
  const newItem: AssessmentAction = { ...data, Id: getNextId() };
  items.push(newItem);
  saveAll(KEYS.assessmentActions, items);
  return newItem;
}

export function updateAction(id: number, updates: Partial<AssessmentAction>): AssessmentAction | undefined {
  const items = getAll<AssessmentAction>(KEYS.assessmentActions);
  const idx = items.findIndex((a) => a.Id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  saveAll(KEYS.assessmentActions, items);
  return items[idx];
}

export function deleteAction(id: number): boolean {
  const items = getAll<AssessmentAction>(KEYS.assessmentActions);
  const filtered = items.filter((a) => a.Id !== id);
  if (filtered.length === items.length) return false;
  saveAll(KEYS.assessmentActions, filtered);
  return true;
}

export function getActionsByAttendee(attendeeId: number): AssessmentAction[] {
  return getAll<AssessmentAction>(KEYS.assessmentActions).filter((a) => a.ResponsiblePartyId === attendeeId);
}

// ============================================
// Assessment Initialization Workflow
// ============================================
export function initializeAssessment(assessmentId: number, assessmentType: AssessmentType): void {
  const masterCategories = getQuestionCategories(assessmentType);
  const categoryIdMap = new Map<number, number>();

  for (const mc of masterCategories) {
    const newCat = createAssessmentCategory({
      Title: mc.Title,
      AssessmentId: assessmentId,
      CategoryId: mc.Id,
      CategoryTargetScore: 5, // Default target
    });
    categoryIdMap.set(mc.Id, newCat.Id);
  }

  const masterQuestions = getQuestionBank(assessmentType);
  let order = 1;

  for (const mq of masterQuestions) {
    const assessmentCategoryId = categoryIdMap.get(mq.CategoryId);
    if (assessmentCategoryId) {
      createAssessmentQuestion({
        Title: mq.Title,
        Question: mq.Question,
        AssessmentId: assessmentId,
        CategoryId: assessmentCategoryId,
        QuestionBankId: mq.Id,
        QuestionScoreFactor: mq.DefaultQuestionScoreFactor,
        QuestionOrder: order++,
        Active: true,
        AdditionalInformation: mq.AdditionalInformation,
        Status: "Unanswered",
      });
    }
  }
}

// ============================================
// Reset (for development)
// ============================================
export function resetAllData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  seedMockData();
}
