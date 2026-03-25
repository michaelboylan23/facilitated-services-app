import { useState } from "react";
import type { Assessment, AssessmentStatus } from "../../types";
import {
  getAssessmentCategories,
  getAssessmentQuestions,
  updateAssessmentCategory,
  updateAssessmentQuestion,
  updateAssessment,
} from "../../services/mockData";

interface Props {
  assessmentId: number;
  assessment: Assessment;
}

const STATUSES: AssessmentStatus[] = ["Draft", "In Progress", "Complete"];

export function SettingsTab({ assessmentId, assessment }: Props) {
  const categories = getAssessmentCategories(assessmentId);
  const questions = getAssessmentQuestions(assessmentId);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [title, setTitle] = useState(assessment.Title);
  const [facilitator, setFacilitator] = useState(assessment.FacilitatorName || "");
  const [pm, setPm] = useState(assessment.ProjectManagerName || "");
  const [status, setStatus] = useState(assessment.AssessmentStatus);
  const [date, setDate] = useState(assessment.AssessmentDate);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateAssessment(assessment.Id, {
      Title: title,
      FacilitatorName: facilitator,
      ProjectManagerName: pm,
      AssessmentStatus: status,
      AssessmentDate: date,
    });
    setEditSection(null);
  };

  return (
    <div className="tab-card">
      {/* Assessment Info */}
      <div className="section-header">
        <h2>Assessment Info</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setEditSection(editSection === "info" ? null : "info")}>
          {editSection === "info" ? "Cancel" : "Edit"}
        </button>
      </div>
      {editSection === "info" ? (
        <form onSubmit={handleSaveInfo} className="admin-form" style={{ marginBottom: "2rem" }}>
          <label>Assessment Name<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
          <div className="form-row">
            <label>Facilitator<input value={facilitator} onChange={(e) => setFacilitator(e.target.value)} /></label>
            <label>Project Manager<input value={pm} onChange={(e) => setPm(e.target.value)} /></label>
          </div>
          <div className="form-row">
            <label>Status
              <select value={status} onChange={(e) => setStatus(e.target.value as AssessmentStatus)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm">Save</button>
          </div>
        </form>
      ) : (
        <div className="detail-fields" style={{ marginBottom: "2rem" }}>
          <div className="detail-field"><span className="field-label">Name</span><span className="field-value">{assessment.Title}</span></div>
          <div className="detail-field"><span className="field-label">Facilitator</span><span className="field-value">{assessment.FacilitatorName || "—"}</span></div>
          <div className="detail-field"><span className="field-label">Project Manager</span><span className="field-value">{assessment.ProjectManagerName || "—"}</span></div>
          <div className="detail-field"><span className="field-label">Status</span><span className="field-value">{assessment.AssessmentStatus}</span></div>
        </div>
      )}

      {/* Target Scores by Category */}
      <div className="section-header">
        <h2>Category Target Scores</h2>
      </div>
      <p style={{ fontSize: "0.85rem", color: "var(--gray)", marginBottom: "0.75rem" }}>
        Adjust target scores for this assessment only. These do not affect master data.
      </p>
      <table className="data-table" style={{ marginBottom: "2rem" }}>
        <thead>
          <tr><th>Category</th><th>Target Score</th></tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.Id}>
              <td>{cat.Title}</td>
              <td>
                <input
                  type="number"
                  value={cat.CategoryTargetScore ?? 5}
                  onChange={(e) => updateAssessmentCategory(cat.Id, { CategoryTargetScore: Number(e.target.value) })}
                  min={0} max={5} step={0.5}
                  style={{ width: 70, padding: "0.25rem 0.5rem", border: "1px solid var(--border)", borderRadius: 4 }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Score Factors */}
      <div className="section-header">
        <h2>Question Score Factors</h2>
      </div>
      <p style={{ fontSize: "0.85rem", color: "var(--gray)", marginBottom: "0.75rem" }}>
        Adjust score factors for this assessment only. These do not affect the master question bank.
      </p>
      <table className="data-table" style={{ marginBottom: "2rem" }}>
        <thead>
          <tr><th>#</th><th>Question</th><th>Score Factor</th><th>Active</th></tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.Id}>
              <td>{q.QuestionOrder}</td>
              <td>{q.Title}</td>
              <td>
                <input
                  type="number"
                  value={q.QuestionScoreFactor}
                  onChange={(e) => updateAssessmentQuestion(q.Id, { QuestionScoreFactor: Number(e.target.value) })}
                  min={0} step={0.5}
                  style={{ width: 70, padding: "0.25rem 0.5rem", border: "1px solid var(--border)", borderRadius: 4 }}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={q.Active}
                  onChange={(e) => updateAssessmentQuestion(q.Id, { Active: e.target.checked })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Export */}
      <div className="section-header">
        <h2>Export</h2>
      </div>
      <button className="btn btn-secondary" disabled title="Functionality TBD">
        Export All Project Data
      </button>
    </div>
  );
}
