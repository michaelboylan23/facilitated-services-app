import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAssessment, getProjectByNumber } from "../../services/mockData";
import { SummaryTab } from "./SummaryTab";
import { ReadinessTab } from "./ReadinessTab";
import { QuestionsTab } from "./QuestionsTab";
import { ActionsTab } from "./ActionsTab";
import { AttendeesTab } from "./AttendeesTab";
import { SettingsTab } from "./SettingsTab";
import "./AssessmentPage.css";

const TABS = [
  { key: "summary", label: "Summary" },
  { key: "readiness", label: "Readiness" },
  { key: "questions", label: "Questions" },
  { key: "actions", label: "Action Items" },
  { key: "attendees", label: "Attendees" },
  { key: "settings", label: "Settings" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [, setRefresh] = useState(0);

  const assessment = getAssessment(Number(id));
  if (!assessment) {
    return <div className="error">Assessment not found.</div>;
  }

  const project = getProjectByNumber(assessment.ProjectNumber);
  const triggerRefresh = () => setRefresh((n) => n + 1);

  return (
    <div className="assessment-page">
      <div className="assessment-header">
        <div>
          <Link to={project ? `/projects/${project.Id}` : "/"} className="back-link">
            ← Back to {project?.ProjectName || "Projects"}
          </Link>
          <h1>{assessment.Title}</h1>
          <div className="assessment-meta">
            <span className={`status-badge status-${assessment.AssessmentStatus.toLowerCase().replace(" ", "-")}`}>
              {assessment.AssessmentStatus}
            </span>
            <span className="meta-item">{assessment.AssessmentType}</span>
            <span className="meta-item">{assessment.AssessmentDate ? new Date(assessment.AssessmentDate).toLocaleDateString() : ""}</span>
          </div>
        </div>
      </div>

      <div className="assessment-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`assessment-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="assessment-content">
        {activeTab === "summary" && <SummaryTab assessment={assessment} project={project || undefined} />}
        {activeTab === "readiness" && <ReadinessTab assessmentId={assessment.Id} />}
        {activeTab === "questions" && <QuestionsTab assessmentId={assessment.Id} onUpdate={triggerRefresh} />}
        {activeTab === "actions" && <ActionsTab assessmentId={assessment.Id} />}
        {activeTab === "attendees" && <AttendeesTab assessmentId={assessment.Id} />}
        {activeTab === "settings" && <SettingsTab assessmentId={assessment.Id} assessment={assessment} />}
      </div>
    </div>
  );
}
