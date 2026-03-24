import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="header-logo">
          Facilitated Services
        </Link>
        {user && (
          <nav className="header-nav">
            {(user.role === "admin" || user.role === "facilitator") && (
              <>
                <Link to="/projects">Projects</Link>
                <Link to="/assessments">Assessments</Link>
              </>
            )}
            {user.role === "admin" && (
              <Link to="/admin">Admin</Link>
            )}
          </nav>
        )}
      </div>
      <div className="header-right">
        {user ? (
          <div className="user-info">
            <span className="user-name">{user.displayName}</span>
            <span className="user-role">{user.role}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
