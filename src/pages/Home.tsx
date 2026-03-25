import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Project, Assessment } from "../types";
import { getProjects, getAssessmentsByProject } from "../services/mockData";
import "./Home.css";

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects] = useState<Project[]>(getProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<"Title" | "ProjectName" | "Client">("Title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let result = [...projects];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.Title.toLowerCase().includes(s) ||
          p.ProjectName.toLowerCase().includes(s) ||
          p.Client.toLowerCase().includes(s)
      );
    }

    if (statusFilter) {
      result = result.filter((p) => p.ProjectStatus === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortField].toLowerCase();
      const bVal = b[sortField].toLowerCase();
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return result;
  }, [projects, search, statusFilter, sortField, sortDir]);

  const statuses = useMemo(() => {
    const set = new Set(projects.map((p) => p.ProjectStatus).filter(Boolean));
    return Array.from(set).sort();
  }, [projects]);

  const toggleExpand = (id: number) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  const handleSort = (field: "Title" | "ProjectName" | "Client") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIndicator = (field: string) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  if (!user) {
    return (
      <div className="home-page">
        <h1>Facilitated Services Assessment</h1>
        <p>Sign in to manage project assessments.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Projects</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" disabled title="Functionality TBD">
            Compare Assessments
          </button>
          {(user.role === "admin" || user.role === "facilitator") && (
            <Link to="/projects/new" className="btn btn-primary">
              Create Project
            </Link>
          )}
        </div>
      </div>

      <div className="dashboard-filters">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}></th>
            <th onClick={() => handleSort("Title")} className="sortable">
              Project #{sortIndicator("Title")}
            </th>
            <th onClick={() => handleSort("ProjectName")} className="sortable">
              Project Name{sortIndicator("ProjectName")}
            </th>
            <th onClick={() => handleSort("Client")} className="sortable">
              Client{sortIndicator("Client")}
            </th>
            <th>Status</th>
            <th>Assessments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => {
            const isExpanded = expandedProject === p.Id;
            const assessments: Assessment[] = isExpanded ? getAssessmentsByProject(p.Title) : [];
            return (
              <ProjectRow
                key={p.Id}
                project={p}
                isExpanded={isExpanded}
                assessments={assessments}
                assessmentCount={getAssessmentsByProject(p.Title).length}
                onToggle={() => toggleExpand(p.Id)}
                onNavigate={(path) => navigate(path)}
              />
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                {search || statusFilter ? "No projects match your filters." : "No projects found. Create your first project to get started."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProjectRow({
  project,
  isExpanded,
  assessments,
  assessmentCount,
  onToggle,
  onNavigate,
}: {
  project: Project;
  isExpanded: boolean;
  assessments: Assessment[];
  assessmentCount: number;
  onToggle: () => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      <tr className={isExpanded ? "row-expanded" : ""}>
        <td>
          <button className="expand-btn" onClick={onToggle}>
            {isExpanded ? "▾" : "▸"}
          </button>
        </td>
        <td>{project.Title}</td>
        <td>{project.ProjectName}</td>
        <td>{project.Client}</td>
        <td>
          <span className={`status-badge status-${project.ProjectStatus?.toLowerCase()}`}>
            {project.ProjectStatus || "—"}
          </span>
        </td>
        <td>{assessmentCount}</td>
        <td>
          <Link to={`/projects/${project.Id}`} className="btn btn-secondary btn-sm">
            View
          </Link>
        </td>
      </tr>
      {isExpanded && (
        <tr className="assessment-dropdown-row">
          <td colSpan={7}>
            <div className="assessment-dropdown">
              {assessments.length > 0 ? (
                <table className="assessment-subtable">
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
                    {assessments.map((a) => (
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
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onNavigate(`/assessments/${a.Id}`)}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-assessments">No assessments for this project.</p>
              )}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate(`/projects/${project.Id}?newAssessment=true`)}
              >
                + New Assessment
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
