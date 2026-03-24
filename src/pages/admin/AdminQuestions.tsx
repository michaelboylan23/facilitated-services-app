import { useState } from "react";
import type { QuestionBankItem, QuestionCategory, AssessmentType } from "../../types";
import {
  getQuestionBank,
  getQuestionCategories,
  createQuestionBankItem,
  updateQuestionBankItem,
  deleteQuestionBankItem,
} from "../../services/mockData";

const ASSESSMENT_TYPES: AssessmentType[] = [
  "Construction Readiness",
  "PDRI",
  "Commissioning Readiness",
];

export function AdminQuestions() {
  const [filterType, setFilterType] = useState<AssessmentType | "">("");
  const [questions, setQuestions] = useState<QuestionBankItem[]>(() => getQuestionBank());
  const [editing, setEditing] = useState<QuestionBankItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [questionTitle, setQuestionTitle] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("Construction Readiness");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [scoreFactor, setScoreFactor] = useState(1);
  const [active, setActive] = useState(true);

  const getCategories = (type: AssessmentType): QuestionCategory[] =>
    getQuestionCategories(type);

  const [availableCategories, setAvailableCategories] = useState<QuestionCategory[]>(
    () => getCategories("Construction Readiness")
  );

  const refresh = () => {
    setQuestions(filterType ? getQuestionBank(filterType as AssessmentType) : getQuestionBank());
  };

  const handleTypeChange = (type: AssessmentType) => {
    setAssessmentType(type);
    const cats = getCategories(type);
    setAvailableCategories(cats);
    setCategoryId(cats[0]?.Id || 0);
  };

  const startNew = () => {
    setEditing(null);
    setIsNew(true);
    const type = (filterType as AssessmentType) || "Construction Readiness";
    setQuestionTitle("");
    setQuestionText("");
    setAssessmentType(type);
    const cats = getCategories(type);
    setAvailableCategories(cats);
    setCategoryId(cats[0]?.Id || 0);
    setScoreFactor(1);
    setActive(true);
  };

  const startEdit = (q: QuestionBankItem) => {
    setEditing(q);
    setIsNew(false);
    setQuestionTitle(q.Title);
    setQuestionText(q.Question);
    setAssessmentType(q.AssessmentType);
    const cats = getCategories(q.AssessmentType);
    setAvailableCategories(cats);
    setCategoryId(q.CategoryId);
    setScoreFactor(q.DefaultQuestionScoreFactor);
    setActive(q.Active);
  };

  const cancel = () => {
    setEditing(null);
    setIsNew(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      Title: questionTitle,
      Question: questionText,
      AssessmentType: assessmentType,
      CategoryId: categoryId,
      DefaultQuestionScoreFactor: scoreFactor,
      Active: active,
    };
    if (isNew) {
      createQuestionBankItem(data);
    } else if (editing) {
      updateQuestionBankItem(editing.Id, data);
    }
    cancel();
    refresh();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this question?")) {
      deleteQuestionBankItem(id);
      refresh();
    }
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type as AssessmentType | "");
    if (type) {
      setQuestions(getQuestionBank(type as AssessmentType));
    } else {
      setQuestions(getQuestionBank());
    }
  };

  // Build a category name lookup
  const allCategories = getQuestionCategories();
  const categoryMap = new Map(allCategories.map((c) => [c.Id, c.Title]));

  return (
    <div>
      <div className="section-header">
        <h2>Question Bank (Master)</h2>
        {!isNew && !editing && (
          <button onClick={startNew} className="btn btn-primary btn-sm">
            Add Question
          </button>
        )}
      </div>

      <div className="filter-bar">
        <label>Filter by type:</label>
        <select value={filterType} onChange={(e) => handleFilterChange(e.target.value)}>
          <option value="">All Types</option>
          {ASSESSMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {(isNew || editing) && (
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-row">
            <label>
              Title (Short Name)
              <input value={questionTitle} onChange={(e) => setQuestionTitle(e.target.value)} required />
            </label>
            <label>
              Assessment Type
              <select value={assessmentType} onChange={(e) => handleTypeChange(e.target.value as AssessmentType)}>
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Question Text
            <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
          </label>
          <div className="form-row">
            <label>
              Category
              <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
                {availableCategories.map((c) => (
                  <option key={c.Id} value={c.Id}>{c.Title}</option>
                ))}
              </select>
            </label>
            <label>
              Score Factor
              <input type="number" value={scoreFactor} onChange={(e) => setScoreFactor(Number(e.target.value))} step={0.5} min={0} required />
            </label>
            <label>
              Active
              <select value={active ? "yes" : "no"} onChange={(e) => setActive(e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm">
              {isNew ? "Create" : "Save"}
            </button>
            <button type="button" onClick={cancel} className="btn btn-secondary btn-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Question</th>
            <th>Type</th>
            <th>Category</th>
            <th>Score Factor</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.Id}>
              <td>{q.Title}</td>
              <td>{q.Question}</td>
              <td>{q.AssessmentType}</td>
              <td>{categoryMap.get(q.CategoryId) || q.CategoryId}</td>
              <td>{q.DefaultQuestionScoreFactor}</td>
              <td>{q.Active ? "Yes" : "No"}</td>
              <td>
                <div className="table-actions">
                  <button onClick={() => startEdit(q)} className="btn btn-secondary btn-icon">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(q.Id)} className="btn btn-danger btn-icon">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {questions.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: "center" }}>No questions</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
