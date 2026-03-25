import { getAssessmentCategories, getAssessmentQuestions, getAssessmentResponses } from "../../services/mockData";

interface Props {
  assessmentId: number;
}

export function ReadinessTab({ assessmentId }: Props) {
  const categories = getAssessmentCategories(assessmentId);
  const questions = getAssessmentQuestions(assessmentId);
  const responses = getAssessmentResponses(assessmentId);

  const categoryStats = categories.map((cat) => {
    const catQuestions = questions.filter((q) => q.CategoryId === cat.Id && q.Status !== "Ignored");
    const catResponses = responses.filter((r) => catQuestions.some((q) => q.Id === r.QuestionId));
    const maxScore = catQuestions.reduce((sum, q) => sum + 5 * q.QuestionScoreFactor, 0);
    const actualScore = catResponses.reduce((sum, r) => sum + r.ResponseScore * (catQuestions.find((q) => q.Id === r.QuestionId)?.QuestionScoreFactor || 1), 0);
    const pct = maxScore > 0 ? Math.round((actualScore / maxScore) * 100) : 0;
    return { ...cat, questionCount: catQuestions.length, answered: catResponses.length, pct, actualScore, maxScore };
  });

  return (
    <div className="tab-card">
      <div className="section-header">
        <h2>Readiness Overview</h2>
        <button className="btn btn-secondary btn-sm" disabled title="Functionality TBD">
          Print / Export
        </button>
      </div>

      {categories.length === 0 ? (
        <p style={{ color: "var(--gray)" }}>No categories. Create an assessment with questions first.</p>
      ) : (
        <div className="readiness-grid">
          {categoryStats.map((cat) => (
            <div key={cat.Id} className="readiness-card">
              <div className="readiness-card-header">
                <span className="readiness-title">{cat.Title}</span>
                <span className="readiness-pct">{cat.pct}%</span>
              </div>
              <div className="readiness-bar">
                <div
                  className="readiness-bar-fill"
                  style={{
                    width: `${cat.pct}%`,
                    background: cat.pct >= 75 ? "var(--teal)" : cat.pct >= 50 ? "var(--lime)" : cat.pct >= 25 ? "#f0ad4e" : "#dc3545",
                  }}
                />
              </div>
              <div className="readiness-meta">
                {cat.answered}/{cat.questionCount} answered
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .readiness-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem; }
        .readiness-card { background: var(--bg); border-radius: 8px; padding: 1rem; }
        .readiness-card-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .readiness-title { font-weight: 600; font-size: 0.9rem; color: var(--navy); }
        .readiness-pct { font-weight: 700; font-size: 1.1rem; color: var(--navy); }
        .readiness-bar { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
        .readiness-bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
        .readiness-meta { font-size: 0.8rem; color: var(--gray); margin-top: 0.4rem; }
      `}</style>
    </div>
  );
}
