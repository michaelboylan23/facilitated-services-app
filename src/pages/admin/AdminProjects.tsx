import { useState } from "react";
import type { Project } from "../../types";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../services/mockData";

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>(getProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [client, setClient] = useState("");

  const refresh = () => setProjects(getProjects());

  const startNew = () => {
    setEditing(null);
    setIsNew(true);
    setTitle("");
    setProjectName("");
    setClient("");
  };

  const startEdit = (p: Project) => {
    setEditing(p);
    setIsNew(false);
    setTitle(p.Title);
    setProjectName(p.ProjectName);
    setClient(p.Client);
  };

  const cancel = () => {
    setEditing(null);
    setIsNew(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      createProject({ Title: title, ProjectName: projectName, Client: client, ProjectStatus: "Active" });
    } else if (editing) {
      updateProject(editing.Id, { Title: title, ProjectName: projectName, Client: client });
    }
    cancel();
    refresh();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this project?")) {
      deleteProject(id);
      refresh();
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Projects</h2>
        {!isNew && !editing && (
          <button onClick={startNew} className="btn btn-primary btn-sm">
            Add Project
          </button>
        )}
      </div>

      {(isNew || editing) && (
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-row">
            <label>
              Project Number
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Client
              <input value={client} onChange={(e) => setClient(e.target.value)} required />
            </label>
          </div>
          <label>
            Project Name
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
          </label>
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
            <th>Project Number</th>
            <th>Project Name</th>
            <th>Client</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.Id}>
              <td>{p.Title}</td>
              <td>{p.ProjectName}</td>
              <td>{p.Client}</td>
              <td>
                <div className="table-actions">
                  <button onClick={() => startEdit(p)} className="btn btn-secondary btn-icon">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.Id)} className="btn btn-danger btn-icon">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: "center" }}>No projects</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
