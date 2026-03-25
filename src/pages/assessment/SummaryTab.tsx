import type { Assessment, Project } from "../../types";

interface Props {
  assessment: Assessment;
  project?: Project;
}

export function SummaryTab({ assessment, project }: Props) {
  return (
    <div className="tab-card">
      <div className="detail-fields" style={{ marginBottom: "1.5rem" }}>
        <div className="detail-field">
          <span className="field-label">Project</span>
          <span className="field-value">{project ? `${project.Title} — ${project.ProjectName}` : assessment.ProjectNumber}</span>
        </div>
        <div className="detail-field">
          <span className="field-label">Client</span>
          <span className="field-value">{project?.Client || "—"}</span>
        </div>
        <div className="detail-field">
          <span className="field-label">Assessment Type</span>
          <span className="field-value">{assessment.AssessmentType}</span>
        </div>
        <div className="detail-field">
          <span className="field-label">Date</span>
          <span className="field-value">
            {assessment.AssessmentDate ? new Date(assessment.AssessmentDate).toLocaleDateString() : "—"}
          </span>
        </div>
        <div className="detail-field">
          <span className="field-label">Facilitator</span>
          <span className="field-value">{assessment.FacilitatorName || "—"}</span>
        </div>
        <div className="detail-field">
          <span className="field-label">Project Manager</span>
          <span className="field-value">{assessment.ProjectManagerName || "—"}</span>
        </div>
        <div className="detail-field">
          <span className="field-label">Status</span>
          <span className={`status-badge status-${assessment.AssessmentStatus.toLowerCase().replace(" ", "-")}`}>
            {assessment.AssessmentStatus}
          </span>
        </div>
        <div className="detail-field">
          <span className="field-label">Score</span>
          <span className="field-value">{assessment.AssessmentScore ?? "—"}</span>
        </div>
      </div>
      <button className="btn btn-secondary" disabled title="Functionality TBD">
        Executive Summary
      </button>
    </div>
  );
}
