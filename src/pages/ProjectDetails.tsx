import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Assessment, AssessmentType, AssessmentStatus } from "../types";
import {
  getProject,
  updateProject,
  getAssessmentsByProject,
  createAssessment,
  initializeAssessment,
} from "../services/mockData";
import "./ProjectDetails.css";

const ASSESSMENT_TYPES: AssessmentType[] = [
  "Construction Readiness",
  "PDRI",
  "Commissioning Readiness",
];

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = getProject(Number(id));

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project?.Title || "");
  const [projectName, setProjectName] = useState(project?.ProjectName || "");
  const [projectStatus, setProjectStatus] = useState(project?.ProjectStatus || "");
  const [client, setClient] = useState(project?.Client || "");

  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<AssessmentType>("Construction Readiness");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [facilitator, setFacilitator] = useState("");
  const [pm, setPm] = useState("");

  if (!project) {
    return <div className="error">Project not found.</div>;
  }

  const assessments = getAssessmentsByProject(project.Title);

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject(project.Id, { Title: title, ProjectName: projectName, ProjectStatus: projectStatus, Client: client });
    setIsEditing(false);
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssessment = createAssessment({
      Title: newTitle || `${project.Title} ${newType}`,
      ProjectNumber: project.Title,
      AssessmentType: newType,
      AssessmentDate: newDate,
      AssessmentStatus: "Draft" as AssessmentStatus,
      FacilitatorName: facilitator,
      ProjectManagerName: pm,
    });
    initializeAssessment(newAssessment.Id, newType);
    setShowNewAssessment(false);
    navigate(`/assessments/${newAssessment.Id}`);
  };

  return (
    <div className="project-details">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">← Back to Projects</Link>
          <h1>{project.ProjectName}</h1>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-card-header">
          <h2>Project Information</h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm">
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProject} className="admin-form">
            <div className="form-row">
              <label>
                Project Number
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              <label>
                Status
                <select value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Planning">Planning</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Closed">Closed</option>
                </select>
              </label>
            </div>
            <label>
              Project Name
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
            </label>
            <label>
              Client
              <input value={client} onChange={(e) => setClient(e.target.value)} required />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-sm">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="detail-fields">
            <div className="detail-field">
              <span className="field-label">Project Number</span>
              <span className="field-value">{project.Title}</span>
            </div>
            <div className="detail-field">
              <span className="field-label">Project Name</span>
              <span className="field-value">{project.ProjectName}</span>
            </div>
            <div className="detail-field">
              <span className="field-label">Client</span>
              <span className="field-value">{project.Client}</span>
            </div>
            <div className="detail-field">
              <span className="field-label">Status</span>
              <span className={`status-badge status-${project.ProjectStatus?.toLowerCase()}`}>
                {project.ProjectStatus || "—"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="detail-card">
        <div className="detail-card-header">
          <h2>Assessments ({assessments.length})</h2>
          <button onClick={() => setShowNewAssessment(!showNewAssessment)} className="btn btn-primary btn-sm">
            {showNewAssessment ? "Cancel" : "+ New Assessment"}
          </button>
        </div>

        {showNewAssessment && (
          <form onSubmit={handleCreateAssessment} className="admin-form" style={{ marginBottom: "1rem" }}>
            <label>
              Assessment Title
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={`${project.Title} ${newType}`}
              />
            </label>
            <div className="form-row">
              <label>
                Assessment Type
                <select value={newType} onChange={(e) => setNewType(e.target.value as AssessmentType)}>
                  {ASSESSMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Date
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
              </label>
            </div>
            <div className="form-row">
              <label>
                Facilitator
                <input value={facilitator} onChange={(e) => setFacilitator(e.target.value)} />
              </label>
              <label>
                Project Manager
                <input value={pm} onChange={(e) => setPm(e.target.value)} />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-sm">Create Assessment</button>
            </div>
          </form>
        )}

        {assessments.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a: Assessment) => (
                <tr key={a.Id}>
                  <td>{a.Title}</td>
                  <td>{a.AssessmentType}</td>
                  <td>{a.AssessmentDate ? new Date(a.AssessmentDate).toLocaleDateString() : "—"}</td>
                  <td>
                    <span className={`status-badge status-${a.AssessmentStatus.toLowerCase().replace(" ", "-")}`}>
                      {a.AssessmentStatus}
                    </span>
                  </td>
                  <td>{a.AssessmentScore ?? "—"}</td>
                  <td>
                    <Link to={`/assessments/${a.Id}`} className="btn btn-primary btn-sm">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "var(--gray)" }}>No assessments yet. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}
