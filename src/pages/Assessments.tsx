import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Assessment } from "../types";
import { getAssessments } from "../services/sharepoint";

export function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAssessments()
      .then(setAssessments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading assessments...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="assessments-page">
      <div className="page-header">
        <h1>Assessments</h1>
        <Link to="/assessments/new" className="btn btn-primary">
          New Assessment
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Assessment</th>
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
              <td>{a.AssessmentDate ? new Date(a.AssessmentDate).toLocaleDateString() : "-"}</td>
              <td>
                <span className={`status-badge status-${a.AssessmentStatus.toLowerCase().replace(" ", "-")}`}>
                  {a.AssessmentStatus}
                </span>
              </td>
              <td>{a.AssessmentScore ?? "-"}</td>
              <td>
                <Link to={`/assessments/${a.Id}`} className="btn btn-sm btn-secondary">
                  Open
                </Link>
              </td>
            </tr>
          ))}
          {assessments.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No assessments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
