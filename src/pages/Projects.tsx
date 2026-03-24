import { useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../types";
import { getProjects } from "../services/mockData";

export function Projects() {
  const [projects] = useState<Project[]>(getProjects);

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <Link to="/admin" className="btn btn-primary">
          Manage Projects
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
                No projects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
