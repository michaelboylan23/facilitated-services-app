import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../types";
import { getProjects } from "../services/sharepoint";

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <Link to="/projects/new" className="btn btn-primary">
          New Project
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Project Number</th>
            <th>Project Name</th>
            <th>Client</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.Id}>
              <td>{project.Title}</td>
              <td>{project.ProjectName}</td>
              <td>{project.Client}</td>
              <td>
                <Link to={`/projects/${project.Id}`} className="btn btn-sm btn-secondary">
                  View
                </Link>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No projects found. Create your first project to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
