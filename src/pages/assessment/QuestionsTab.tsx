import { useState, useMemo } from "react";
import type { AssessmentQuestion, AssessmentCategory, QuestionStatus } from "../../types";
import {
  getAssessmentQuestions,
  getAssessmentCategories,
  getResponseByQuestion,
} from "../../services/mockData";
import { QuestionDetailModal } from "./QuestionDetailModal";

interface Props {
  assessmentId: number;
  onUpdate: () => void;
}

export function QuestionsTab({ assessmentId, onUpdate }: Props) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>(() => getAssessmentQuestions(assessmentId));
  const categories = getAssessmentCategories(assessmentId);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | "">("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const refresh = () => {
    setQuestions(getAssessmentQuestions(assessmentId));
    onUpdate();
  };

  const filtered = useMemo(() => {
    let result = [...questions];
    if (activeCategory !== "all") {
      result = result.filter((q) => q.CategoryId === activeCategory);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((q) => q.Title.toLowerCase().includes(s) || q.Question.toLowerCase().includes(s));
    }
    if (statusFilter) {
      result = result.filter((q) => q.Status === statusFilter);
    }
    return result;
  }, [questions, activeCategory, search, statusFilter]);

  // Progress stats
  const total = questions.length;
  const answered = questions.filter((q) => q.Status === "Answered").length;
  const ignored = questions.filter((q) => q.Status === "Ignored").length;
  const unanswered = total - answered - ignored;

  const categoryMap = new Map<number, AssessmentCategory>(categories.map((c) => [c.Id, c]));

  return (
    <div>
      {/* Progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div className="progress-segment progress-answered" style={{ width: `${total ? (answered / total) * 100 : 0}%` }} />
          <div className="progress-segment progress-ignored" style={{ width: `${total ? (ignored / total) * 100 : 0}%` }} />
        </div>
        <span className="progress-label">
          {answered} answered · {unanswered} remaining · {ignored} ignored
        </span>
      </div>

      <div className="tab-card">
        {/* Category tabs */}
        <div className="category-tabs">
          <button
            className={`category-tab ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All ({questions.length})
          </button>
          {categories.map((cat) => {
            const count = questions.filter((q) => q.CategoryId === cat.Id).length;
            return (
              <button
                key={cat.Id}
                className={`category-tab ${activeCategory === cat.Id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.Id)}
              >
                {cat.Title} ({count})
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="dashboard-filters" style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as QuestionStatus | "")}>
            <option value="">All Statuses</option>
            <option value="Unanswered">Unanswered</option>
            <option value="Answered">Answered</option>
            <option value="Ignored">Ignored</option>
          </select>
          <button className="btn btn-secondary btn-sm" disabled title="Functionality TBD">
            Print / Export
          </button>
        </div>

        {/* Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Score</th>
              <th>Factor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => {
              const response = getResponseByQuestion(q.Id);
              return (
                <tr
                  key={q.Id}
                  onClick={() => setSelectedQuestionId(q.Id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{q.QuestionOrder}</td>
                  <td>{q.Title}</td>
                  <td>{categoryMap.get(q.CategoryId)?.Title || "—"}</td>
                  <td>
                    {q.Priority && (
                      <span className={`priority-badge priority-${q.Priority.toLowerCase()}`}>
                        {q.Priority}
                      </span>
                    )}
                  </td>
                  <td>{q.Status === "Ignored" ? "—" : response?.ResponseScore ?? "—"}</td>
                  <td>{q.QuestionScoreFactor}</td>
                  <td>
                    <span className={`status-badge status-q-${q.Status.toLowerCase()}`}>
                      {q.Status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center" }}>No questions match filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Question detail modal */}
      {selectedQuestionId && (
        <QuestionDetailModal
          questionId={selectedQuestionId}
          questions={filtered}
          assessmentId={assessmentId}
          categories={categories}
          onClose={() => setSelectedQuestionId(null)}
          onNavigate={setSelectedQuestionId}
          onSave={refresh}
        />
      )}

      <style>{`
        .category-tabs { display: flex; gap: 0.25rem; overflow-x: auto; padding-bottom: 0.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
        .category-tab { padding: 0.4rem 0.8rem; background: none; border: 1px solid var(--border); border-radius: 16px; font-size: 0.8rem; color: var(--gray); cursor: pointer; white-space: nowrap; transition: all 0.15s; }
        .category-tab.active { background: var(--navy); color: var(--white); border-color: var(--navy); }
        .category-tab:hover:not(.active) { border-color: var(--cyan); color: var(--cyan); }
        .priority-badge { font-size: 0.75rem; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 500; }
        .priority-high { background: #f8d7da; color: #721c24; }
        .priority-medium { background: #fff3cd; color: #856404; }
        .priority-low { background: #d4edda; color: #155724; }
        .status-q-unanswered { background: #fff3cd; color: #856404; }
        .status-q-answered { background: #d1f0ec; color: #056b63; }
        .status-q-ignored { background: #e1e3e8; color: var(--gray); }
      `}</style>
    </div>
  );
}
