import { useState, useMemo } from "react";
import type { AssessmentAction, ActionStatus } from "../../types";
import {
  getAssessmentActions,
  getAssessmentAttendees,
  getAssessmentQuestions,
  createAction,
  updateAction,
  deleteAction,
} from "../../services/mockData";

interface Props {
  assessmentId: number;
}

const STATUSES: ActionStatus[] = ["Open", "In Progress", "Complete", "Closed"];

export function ActionsTab({ assessmentId }: Props) {
  const [actions, setActions] = useState<AssessmentAction[]>(() => getAssessmentActions(assessmentId));
  const attendees = getAssessmentAttendees(assessmentId);
  const questions = getAssessmentQuestions(assessmentId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [actionText, setActionText] = useState("");
  const [actionStatus, setActionStatus] = useState<ActionStatus>("Open");
  const [targetDate, setTargetDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [responsiblePartyId, setResponsiblePartyId] = useState<number | "">("");
  const [questionId, setQuestionId] = useState<number | "">("");

  const refresh = () => setActions(getAssessmentActions(assessmentId));

  const resetForm = () => {
    setActionText(""); setActionStatus("Open"); setTargetDate(""); setCompletedDate("");
    setResponsiblePartyId(""); setQuestionId(""); setEditingId(null); setShowForm(false);
  };

  const startEdit = (a: AssessmentAction) => {
    setEditingId(a.Id);
    setActionText(a.Action);
    setActionStatus(a.ActionStatus);
    setTargetDate(a.TargetDate || "");
    setCompletedDate(a.CompletedDate || "");
    setResponsiblePartyId(a.ResponsiblePartyId || "");
    setQuestionId(a.QuestionId || "");
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const attendee = attendees.find((a) => a.Id === Number(responsiblePartyId));
    const data = {
      AssessmentId: assessmentId,
      Action: actionText,
      ActionStatus: actionStatus,
      TargetDate: targetDate || undefined,
      CompletedDate: completedDate || undefined,
      ResponsiblePartyId: responsiblePartyId ? Number(responsiblePartyId) : undefined,
      ResponsibleParty: attendee?.Attendee,
      Company: attendee?.Company,
      Email: attendee?.Email,
      Role: attendee?.Role,
      QuestionId: questionId ? Number(questionId) : undefined,
    };
    if (editingId) {
      updateAction(editingId, data);
    } else {
      createAction(data);
    }
    resetForm();
    refresh();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this action item?")) {
      deleteAction(id);
      refresh();
    }
  };

  const filtered = useMemo(() => {
    let result = [...actions];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((a) =>
        a.Action.toLowerCase().includes(s) || (a.ResponsibleParty || "").toLowerCase().includes(s)
      );
    }
    if (statusFilter) {
      result = result.filter((a) => a.ActionStatus === statusFilter);
    }
    return result;
  }, [actions, search, statusFilter]);

  const questionMap = new Map(questions.map((q) => [q.Id, q]));

  return (
    <div className="tab-card">
      <div className="section-header">
        <h2>Action Items ({actions.length})</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary btn-sm" disabled title="Functionality TBD">Print / Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>Add Action</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="admin-form" style={{ marginBottom: "1rem" }}>
          <label>
            Action
            <textarea value={actionText} onChange={(e) => setActionText(e.target.value)} required />
          </label>
          <div className="form-row">
            <label>
              Status
              <select value={actionStatus} onChange={(e) => setActionStatus(e.target.value as ActionStatus)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              Responsible Party
              <select value={responsiblePartyId} onChange={(e) => setResponsiblePartyId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">— Select —</option>
                {attendees.map((a) => <option key={a.Id} value={a.Id}>{a.Attendee}</option>)}
              </select>
            </label>
            <label>
              Related Question
              <select value={questionId} onChange={(e) => setQuestionId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">— None —</option>
                {questions.map((q) => <option key={q.Id} value={q.Id}>#{q.QuestionOrder} {q.Title}</option>)}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>Target Date<input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></label>
            <label>Completed Date<input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} /></label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm">{editingId ? "Save" : "Create"}</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      <div className="dashboard-filters" style={{ marginBottom: "1rem" }}>
        <input type="text" placeholder="Search actions..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ActionStatus | "")}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Question</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Target Date</th>
            <th>Completed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => {
            const q = a.QuestionId ? questionMap.get(a.QuestionId) : null;
            return (
              <tr key={a.Id}>
                <td>{a.Action}</td>
                <td>{q ? `#${q.QuestionOrder} ${q.Title}` : "—"}</td>
                <td><span className={`status-badge status-${a.ActionStatus.toLowerCase().replace(" ", "-")}`}>{a.ActionStatus}</span></td>
                <td>{a.ResponsibleParty || "—"}</td>
                <td>{a.TargetDate || "—"}</td>
                <td>{a.CompletedDate || "—"}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-icon" onClick={() => startEdit(a)}>Edit</button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(a.Id)}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center" }}>No action items.</td></tr>}
        </tbody>
      </table>

      <style>{`
        .status-open { background: #cce5ff; color: #004085; }
        .status-closed { background: #e1e3e8; color: var(--gray); }
      `}</style>
    </div>
  );
}
