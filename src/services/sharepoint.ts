import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import type {
  Project,
  Assessment,
  QuestionCategory,
  QuestionBankItem,
  AssessmentCategory,
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentAttendee,
  AssessmentType,
} from "../types";

const SHAREPOINT_SITE = "https://mbpce.sharepoint.com/sites/PRAC-FSR";

// List names as they exist in SharePoint
const LISTS = {
  Projects: "Projects",
  Assessments: "Assessments",
  QuestionCategories: "Question Categories",
  QuestionBank: "Question Bank",
  AssessmentCategories: "Assessment Categories",
  AssessmentQuestions: "Assessment Questions",
  AssessmentResponses: "Assessment Responses",
  AssessmentAttendees: "Assessment Attendees",
} as const;

let _sp: ReturnType<typeof spfi> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function initSharePoint(context: any): void {
  _sp = spfi(SHAREPOINT_SITE).using(SPFx(context));
}

function getSP() {
  if (!_sp) {
    throw new Error("SharePoint not initialized. Call initSharePoint first.");
  }
  return _sp;
}

// ============================================
// Projects
// ============================================

export async function getProjects(): Promise<Project[]> {
  return getSP().web.lists.getByTitle(LISTS.Projects).items();
}

export async function getProject(id: number): Promise<Project> {
  return getSP().web.lists.getByTitle(LISTS.Projects).items.getById(id)();
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const result = await getSP().web.lists.getByTitle(LISTS.Projects).items.add(project);
  return result;
}

// ============================================
// Assessments
// ============================================

export async function getAssessments(): Promise<Assessment[]> {
  return getSP().web.lists.getByTitle(LISTS.Assessments).items();
}

export async function getAssessmentsByProject(projectNumber: string): Promise<Assessment[]> {
  return getSP()
    .web.lists.getByTitle(LISTS.Assessments)
    .items.filter(`ProjectNumber eq '${projectNumber}'`)();
}

export async function getAssessment(id: number): Promise<Assessment> {
  return getSP().web.lists.getByTitle(LISTS.Assessments).items.getById(id)();
}

export async function createAssessment(assessment: Partial<Assessment>): Promise<Assessment> {
  return getSP().web.lists.getByTitle(LISTS.Assessments).items.add(assessment);
}

export async function updateAssessment(
  id: number,
  updates: Partial<Assessment>
): Promise<void> {
  await getSP().web.lists.getByTitle(LISTS.Assessments).items.getById(id).update(updates);
}

// ============================================
// Master Question Categories
// ============================================

export async function getQuestionCategories(
  assessmentType: AssessmentType
): Promise<QuestionCategory[]> {
  return getSP()
    .web.lists.getByTitle(LISTS.QuestionCategories)
    .items.filter(`AssessmentType eq '${assessmentType}' and Active eq 1`)
    .orderBy("CategoryOrder")();
}

// ============================================
// Master Question Bank
// ============================================

export async function getQuestionBank(
  assessmentType: AssessmentType
): Promise<QuestionBankItem[]> {
  return getSP()
    .web.lists.getByTitle(LISTS.QuestionBank)
    .items.filter(`AssessmentType eq '${assessmentType}' and Active eq 1`)();
}

// ============================================
// Assessment Categories (instances)
// ============================================

export async function getAssessmentCategories(
  assessmentId: number
): Promise<AssessmentCategory[]> {
  return getSP()
    .web.lists.getByTitle(LISTS.AssessmentCategories)
    .items.filter(`AssessmentId eq ${assessmentId}`)();
}

export async function createAssessmentCategory(
  category: Partial<AssessmentCategory>
): Promise<AssessmentCategory> {
  return getSP().web.lists.getByTitle(LISTS.AssessmentCategories).items.add(category);
}

// ============================================
// Assessment Questions (instances)
// ============================================

export async function getAssessmentQuestions(
  assessmentId: number
): Promise<AssessmentQuestion[]> {
  return getSP()
    .web.lists.getByTitle(LISTS.AssessmentQuestions)
    .items.filter(`AssessmentId eq ${assessmentId}`)();
}

export async function createAssessmentQuestion(
  question: Partial<AssessmentQuestion>
): Promise<AssessmentQuestion> {
  return getSP().web.lists.getByTitle(LISTS.AssessmentQuestions).items.add(question);
}

// ============================================
// Assessment Responses
// ============================================

export async function getAssessmentResponses(
  assessmentId: number
): Promise<AssessmentResponse[]> {
  return getSP()
    .web.lists.getByTitle(LISTS.AssessmentResponses)
    .items.filter(`AssessmentId eq ${assessmentId}`)();
}

export async function saveResponse(
  response: Partial<AssessmentResponse>
): Promise<AssessmentResponse> {
  return getSP().web.lists.getByTitle(LISTS.AssessmentResponses).items.add(response);
}

export async function updateResponse(
  id: number,
  updates: Partial<AssessmentResponse>
): Promise<void> {
  await getSP()
    .web.lists.getByTitle(LISTS.AssessmentResponses)
    .items.getById(id)
    .update(updates);
}

// ============================================
// Assessment Attendees
// ============================================

export async function getAssessmentAttendees(
  assessmentId: number
): Promise<AssessmentAttendee[]> {
  return getSP()
    .web.lists.getByTitle(LISTS.AssessmentAttendees)
    .items.filter(`AssessmentId eq ${assessmentId}`)();
}

export async function addAttendee(
  attendee: Partial<AssessmentAttendee>
): Promise<AssessmentAttendee> {
  return getSP().web.lists.getByTitle(LISTS.AssessmentAttendees).items.add(attendee);
}

// ============================================
// Assessment Creation Workflow
// Copies master categories & questions into assessment-specific instances
// ============================================

export async function initializeAssessment(
  assessmentId: number,
  assessmentType: AssessmentType
): Promise<void> {
  // 1. Get master categories for this assessment type
  const masterCategories = await getQuestionCategories(assessmentType);

  // 2. Create assessment category instances & build ID mapping
  const categoryIdMap = new Map<number, number>(); // master ID -> assessment category ID

  for (const mc of masterCategories) {
    const newCat = await createAssessmentCategory({
      Title: mc.Title,
      AssessmentId: assessmentId,
      CategoryId: mc.Id,
    });
    categoryIdMap.set(mc.Id, newCat.Id);
  }

  // 3. Get master questions for this assessment type
  const masterQuestions = await getQuestionBank(assessmentType);

  // 4. Create assessment question instances
  for (const mq of masterQuestions) {
    const assessmentCategoryId = categoryIdMap.get(mq.CategoryId);
    if (assessmentCategoryId) {
      await createAssessmentQuestion({
        Title: mq.Title,
        Question: mq.Question,
        AssessmentId: assessmentId,
        CategoryId: assessmentCategoryId,
        QuestionBankId: mq.Id,
        QuestionScoreFactor: mq.DefaultQuestionScoreFactor,
        Active: true,
      });
    }
  }
}
