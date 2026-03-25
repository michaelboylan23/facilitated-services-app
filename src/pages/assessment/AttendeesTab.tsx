import { useState, useMemo } from "react";
import type { AssessmentAttendee } from "../../types";
import {
  getAssessmentAttendees,
  addAttendee,
  updateAttendee,
  deleteAttendee,
  getActionsByAttendee,
} from "../../services/mockData";

interface Props {
  assessmentId: number;
}

export function AttendeesTab({ assessmentId }: Props) {
  const [attendees, setAttendees] = useState<AssessmentAttendee[]>(() => getAssessmentAttendees(assessmentId));
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const refresh = () => setAttendees(getAssessmentAttendees(assessmentId));

  const resetForm = () => {
    setName(""); setCompany(""); setRole(""); setEmail("");
    setEditingId(null); setShowForm(false);
  };

  const startEdit = (a: AssessmentAttendee) => {
    setEditingId(a.Id);
    setName(a.Attendee);
    setCompany(a.Company || "");
    setRole(a.Role);
    setEmail(a.Email || "");
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { AssessmentId: assessmentId, Attendee: name, Company: company, Role: role, Email: email };
    if (editingId) {
      updateAttendee(editingId, data);
    } else {
      addAttendee(data);
    }
    resetForm();
    refresh();
  };

  const handleDelete = (id: number) => {
    const actions = getActionsByAttendee(id);
    const msg = actions.length > 0
      ? `This attendee has ${actions.length} action(s) assigned. Delete anyway?`
      : "Delete this attendee?";
    if (window.confirm(msg)) {
      deleteAttendee(id);
      refresh();
    }
  };

  const filtered = useMemo(() => {
    if (!search) return attendees;
    const s = search.toLowerCase();
    return attendees.filter((a) =>
      a.Attendee.toLowerCase().includes(s) ||
      (a.Company || "").toLowerCase().includes(s) ||
      a.Role.toLowerCase().includes(s)
    );
  }, [attendees, search]);

  return (
    <div className="tab-card">
      <div className="section-header">
        <h2>Attendees ({attendees.length})</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary btn-sm" disabled title="Functionality TBD">Print / Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>Add Attendee</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="admin-form" style={{ marginBottom: "1rem" }}>
          <div className="form-row">
            <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
            <label>Company<input value={company} onChange={(e) => setCompany(e.target.value)} /></label>
          </div>
          <div className="form-row">
            <label>Role<input value={role} onChange={(e) => setRole(e.target.value)} /></label>
            <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm">{editingId ? "Save" : "Add"}</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      <div className="dashboard-filters" style={{ marginBottom: "1rem" }}>
        <input type="text" placeholder="Search attendees..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Role</th>
            <th>Email</th>
            <th>Actions</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => {
            const actionCount = getActionsByAttendee(a.Id).length;
            return (
              <tr key={a.Id}>
                <td>{a.Attendee}</td>
                <td>{a.Company || "—"}</td>
                <td>{a.Role || "—"}</td>
                <td>{a.Email || "—"}</td>
                <td>
                  {actionCount > 0 ? (
                    <span style={{ color: "var(--cyan)", cursor: "pointer" }}>
                      {actionCount} action{actionCount !== 1 ? "s" : ""}
                    </span>
                  ) : "0"}
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-icon" onClick={() => startEdit(a)}>Edit</button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(a.Id)}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center" }}>No attendees.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
