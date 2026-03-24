import { useState } from "react";
import type { QuestionCategory, AssessmentType } from "../../types";
import {
  getQuestionCategories,
  createQuestionCategory,
  updateQuestionCategory,
  deleteQuestionCategory,
} from "../../services/mockData";

const ASSESSMENT_TYPES: AssessmentType[] = [
  "Construction Readiness",
  "PDRI",
  "Commissioning Readiness",
];

export function AdminCategories() {
  const [filterType, setFilterType] = useState<AssessmentType | "">("");
  const [categories, setCategories] = useState<QuestionCategory[]>(() => getQuestionCategories());
  const [editing, setEditing] = useState<QuestionCategory | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [title, setTitle] = useState("");
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("Construction Readiness");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState(0);
  const [order, setOrder] = useState(1);
  const [active, setActive] = useState(true);

  const refresh = () => {
    setCategories(filterType ? getQuestionCategories(filterType as AssessmentType) : getQuestionCategories());
  };

  const startNew = () => {
    setEditing(null);
    setIsNew(true);
    setTitle("");
    setAssessmentType(filterType as AssessmentType || "Construction Readiness");
    setDescription("");
    setWeight(0);
    setOrder(categories.length + 1);
    setActive(true);
  };

  const startEdit = (c: QuestionCategory) => {
    setEditing(c);
    setIsNew(false);
    setTitle(c.Title);
    setAssessmentType(c.AssessmentType);
    setDescription(c.CategoryDescription);
    setWeight(c.CategoryWeight);
    setOrder(c.CategoryOrder);
    setActive(c.Active);
  };

  const cancel = () => {
    setEditing(null);
    setIsNew(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      Title: title,
      AssessmentType: assessmentType,
      CategoryDescription: description,
      CategoryWeight: weight,
      CategoryOrder: order,
      Active: active,
    };
    if (isNew) {
      createQuestionCategory(data);
    } else if (editing) {
      updateQuestionCategory(editing.Id, data);
    }
    cancel();
    refresh();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this category?")) {
      deleteQuestionCategory(id);
      refresh();
    }
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type as AssessmentType | "");
    if (type) {
      setCategories(getQuestionCategories(type as AssessmentType));
    } else {
      setCategories(getQuestionCategories());
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Question Categories (Master)</h2>
        {!isNew && !editing && (
          <button onClick={startNew} className="btn btn-primary btn-sm">
            Add Category
          </button>
        )}
      </div>

      <div className="filter-bar">
        <label>Filter by type:</label>
        <select value={filterType} onChange={(e) => handleFilterChange(e.target.value)}>
          <option value="">All Types</option>
          {ASSESSMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {(isNew || editing) && (
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-row">
            <label>
              Category Name
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Assessment Type
              <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}>
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="form-row">
            <label>
              Weight
              <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} min={0} required />
            </label>
            <label>
              Order
              <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={1} required />
            </label>
            <label>
              Active
              <select value={active ? "yes" : "no"} onChange={(e) => setActive(e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>
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
            <th>Order</th>
            <th>Category</th>
            <th>Assessment Type</th>
            <th>Description</th>
            <th>Weight</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.Id}>
              <td>{c.CategoryOrder}</td>
              <td>{c.Title}</td>
              <td>{c.AssessmentType}</td>
              <td>{c.CategoryDescription}</td>
              <td>{c.CategoryWeight}</td>
              <td>{c.Active ? "Yes" : "No"}</td>
              <td>
                <div className="table-actions">
                  <button onClick={() => startEdit(c)} className="btn btn-secondary btn-icon">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.Id)} className="btn btn-danger btn-icon">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: "center" }}>No categories</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
