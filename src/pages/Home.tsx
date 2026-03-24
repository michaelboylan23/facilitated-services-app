import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="home-page">
        <h1>Facilitated Services Assessment</h1>
        <p>Sign in with your Microsoft account to manage project assessments.</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <h1>Welcome, {user.displayName}</h1>
      <p>Manage project readiness assessments for Construction, PDRI, and Commissioning.</p>
      <div className="home-actions">
        <Link to="/projects" className="btn btn-primary">
          View Projects
        </Link>
        <Link to="/assessments" className="btn btn-secondary">
          View Assessments
        </Link>
      </div>
    </div>
  );
}
