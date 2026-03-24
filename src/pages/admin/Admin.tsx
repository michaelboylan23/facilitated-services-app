import { useState } from "react";
import { AdminProjects } from "./AdminProjects";
import { AdminCategories } from "./AdminCategories";
import { AdminQuestions } from "./AdminQuestions";
import { AdminAssessments } from "./AdminAssessments";
import { resetAllData } from "../../services/mockData";
import "./Admin.css";

const TABS = [
  { key: "projects", label: "Projects" },
  { key: "categories", label: "Question Categories" },
  { key: "questions", label: "Question Bank" },
  { key: "assessments", label: "Assessments" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function Admin() {
  const [activeTab, setActiveTab] = useState<TabKey>("projects");

  const handleReset = () => {
    if (window.confirm("Reset all data to defaults? This cannot be undone.")) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <button onClick={handleReset} className="btn btn-secondary btn-sm">
          Reset Mock Data
        </button>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === "projects" && <AdminProjects />}
        {activeTab === "categories" && <AdminCategories />}
        {activeTab === "questions" && <AdminQuestions />}
        {activeTab === "assessments" && <AdminAssessments />}
      </div>
    </div>
  );
}
