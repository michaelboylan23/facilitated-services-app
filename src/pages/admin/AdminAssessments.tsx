import { useState } from "react";
import type { Assessment, AssessmentType, AssessmentStatus } from "../../types";
import {
  getAssessments,
  getProjects,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  initializeAssessment,
} from "../../services/mockData";

const ASSESSMENT_TYPES: AssessmentType[] = [
  "Construction Readiness",
  "PDRI",
  "Commissioning Readiness",
];

const STATUSES: AssessmentStatus[] = ["Draft", "In Progress", "Complete"];

export function AdminAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>(getAssessments);
  const [editing, setEditing] = useState<Assessment | null>(null);
  const [isNew, setIsNew] = useState(false);

  const projects = getProjects();

  const [title, setTitle] = useState("");
  const [projectNumber, setProjectNumber] = useState("");
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("Construction Readiness");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus>("Draft");

  const refresh = () => setAssessments(getAssessments());

  const startNew = () => {
    setEditing(null);
    setIsNew(true);
    setTitle("");
    setProjectNumber(projects[0]?.Title || "");
    setAssessmentType("Construction Readiness");
    setAssessmentDate(new Date().toISOString().split("T")[0]);
    setAssessmentStatus("Draft");
  };

  const startEdit = (a: Assessment) => {
    setEditing(a);
    setIsNew(false);
    setTitle(a.Title);
    setProjectNumber(a.ProjectNumber);
    setAssessmentType(a.AssessmentType);
    setAssessmentDate(a.AssessmentDate);
    setAssessmentStatus(a.AssessmentStatus);
  };

  const cancel = () => {
    setEditing(null);
    setIsNew(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      const newAssessment = createAssessment({
        Title: title,
        ProjectNumber: projectNumber,
        AssessmentType: assessmentType,
        AssessmentDate: assessmentDate,
        AssessmentStatus: assessmentStatus,
      });
      // Copy master categories + questions into this assessment
      initializeAssessment(newAssessment.Id, assessmentType);
    } else if (editing) {
      updateAssessment(editing.Id, {
        Title: title,
        ProjectNumber: projectNumber,
        AssessmentType: assessmentType,
        AssessmentDate: assessmentDate,
        AssessmentStatus: assessmentStatus,
      });
    }
    cancel();
    refresh();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this assessment?")) {
      deleteAssessment(id);
      refresh();
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Assessments</h2>
        {!isNew && !editing && (
          <button onClick={startNew} className="btn btn-primary btn-sm">
            New Assessment
          </button>
        )}
      </div>

      {(isNew || editing) && (
        <form onSubmit={handleSave} className="admin-form">
          <label>
            Assessment Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <div className="form-row">
            <label>
              Project
              <select value={projectNumber} onChange={(e) => setProjectNumber(e.target.value)}>
                {projects.map((p) => (
                  <option key={p.Id} value={p.Title}>
                    {p.Title} — {p.ProjectName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assessment Type
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                disabled={!!editing}
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Date
              <input type="date" value={assessmentDate} onChange={(e) => setAssessmentDate(e.target.value)} required />
            </label>
            <label>
              Status
              <select value={assessmentStatus} onChange={(e) => setAssessmentStatus(e.target.value as AssessmentStatus)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
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
            <th>Project</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((a) => (
            <tr key={a.Id}>
              <td>{a.Title}</td>
              <td>{a.ProjectNumber}</td>
              <td>{a.AssessmentType}</td>
              <td>{a.AssessmentDate}</td>
              <td>
                <span className={`status-badge status-${a.AssessmentStatus.toLowerCase().replace(" ", "-")}`}>
                  {a.AssessmentStatus}
                </span>
              </td>
              <td>{a.AssessmentScore ?? "—"}</td>
              <td>
                <div className="table-actions">
                  <button onClick={() => startEdit(a)} className="btn btn-secondary btn-icon">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(a.Id)} className="btn btn-danger btn-icon">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {assessments.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: "center" }}>No assessments</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
