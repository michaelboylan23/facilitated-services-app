import { useState, useEffect } from "react";
import type { AssessmentQuestion, AssessmentCategory, QuestionPriority } from "../../types";
import {
  getAssessmentQuestion,
  getResponseByQuestion,
  upsertResponse,
  updateAssessmentQuestion,
} from "../../services/mockData";

interface Props {
  questionId: number;
  questions: AssessmentQuestion[];
  assessmentId: number;
  categories: AssessmentCategory[];
  onClose: () => void;
  onNavigate: (id: number) => void;
  onSave: () => void;
}

export function QuestionDetailModal({ questionId, questions, assessmentId, categories, onClose, onNavigate, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isIgnored, setIsIgnored] = useState(false);
  const [response, setResponse] = useState("");
  const [comments, setComments] = useState("");
  const [priority, setPriority] = useState<QuestionPriority | "">("");

  const question = getAssessmentQuestion(questionId);
  const categoryMap = new Map(categories.map((c) => [c.Id, c]));

  useEffect(() => {
    if (!question) return;
    const existing = getResponseByQuestion(question.Id);
    setScore(existing?.ResponseScore ?? null);
    setResponse(existing?.Response || "");
    setComments(existing?.Comments || "");
    setIsIgnored(question.Status === "Ignored");
    setPriority(question.Priority || "");
    setIsEditing(false);
  }, [questionId]);

  if (!question) return null;

  const currentIdx = questions.findIndex((q) => q.Id === questionId);
  const prevQ = currentIdx > 0 ? questions[currentIdx - 1] : null;
  const nextQ = currentIdx < questions.length - 1 ? questions[currentIdx + 1] : null;

  const handleSave = () => {
    if (isIgnored) {
      updateAssessmentQuestion(question.Id, { Status: "Ignored", Priority: priority || undefined });
    } else {
      if (score !== null) {
        upsertResponse(question.Id, {
          AssessmentId: assessmentId,
          QuestionId: question.Id,
          CategoryId: question.CategoryId,
          Response: response,
          ResponseScore: score,
          ResponseDate: new Date().toISOString(),
          Comments: comments,
          Question: question.Question,
        });
        updateAssessmentQuestion(question.Id, { Status: "Answered", Priority: priority || undefined });
      } else {
        updateAssessmentQuestion(question.Id, { Priority: priority || undefined });
      }
    }
    onSave();
  };

  const handleIgnore = () => {
    setIsIgnored(!isIgnored);
    if (!isIgnored) {
      setScore(null);
    }
  };

  return (
    <div className="question-detail-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="question-detail">
        <div className="question-detail-header">
          <div className="question-nav">
            <button disabled={!prevQ} onClick={() => prevQ && onNavigate(prevQ.Id)}>← Prev</button>
            <select
              value={questionId}
              onChange={(e) => onNavigate(Number(e.target.value))}
            >
              {questions.map((q) => (
                <option key={q.Id} value={q.Id}>
                  #{q.QuestionOrder} — {q.Title}
                </option>
              ))}
            </select>
            <button disabled={!nextQ} onClick={() => nextQ && onNavigate(nextQ.Id)}>Next →</button>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="question-detail-fields">
          <div className="field-row">
            <div className="detail-field">
              <span className="field-label">Question #{question.QuestionOrder}</span>
              <span className="field-value" style={{ fontSize: "1.1rem", fontWeight: 500 }}>{question.Question}</span>
            </div>
          </div>

          <div className="field-row">
            <div className="detail-field">
              <span className="field-label">Category</span>
              <span className="field-value">{categoryMap.get(question.CategoryId)?.Title || "—"}</span>
            </div>
            <div className="detail-field">
              <span className="field-label">Score Factor</span>
              <span className="field-value">{isEditing ? (
                <input
                  type="number"
                  value={question.QuestionScoreFactor}
                  onChange={(e) => updateAssessmentQuestion(question.Id, { QuestionScoreFactor: Number(e.target.value) })}
                  style={{ width: 60, padding: "0.25rem" }}
                  step={0.5}
                  min={0}
                />
              ) : question.QuestionScoreFactor}</span>
            </div>
            <div className="detail-field">
              <span className="field-label">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as QuestionPriority | "")}
                style={{ padding: "0.3rem", borderRadius: 4, border: "1px solid var(--border)" }}
              >
                <option value="">None</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {question.AdditionalInformation && (
            <div className="detail-field">
              <span className="field-label">Additional Information</span>
              <span className="field-value">{question.AdditionalInformation}</span>
            </div>
          )}

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.5rem 0" }} />

          {/* Score */}
          <div className="detail-field">
            <span className="field-label">Score</span>
            <div className="score-input-group">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`score-btn ${score === n && !isIgnored ? "selected" : ""}`}
                  onClick={() => { setScore(n); setIsIgnored(false); }}
                  disabled={isIgnored}
                >
                  {n}
                </button>
              ))}
              <button
                className={`score-btn ${isIgnored ? "ignored" : ""}`}
                onClick={handleIgnore}
                style={{ width: "auto", padding: "0 0.75rem" }}
              >
                Ignore
              </button>
            </div>
          </div>

          {/* Response */}
          <div className="detail-field">
            <span className="field-label">Response</span>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
              disabled={isIgnored}
              style={{ padding: "0.5rem", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical" }}
            />
          </div>

          {/* Comments */}
          <div className="detail-field">
            <span className="field-label">Comments</span>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={2}
              disabled={isIgnored}
              style={{ padding: "0.5rem", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical" }}
            />
          </div>

          <div className="form-actions" style={{ justifyContent: "space-between", display: "flex" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Done Editing" : "Edit Question"}
            </button>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
