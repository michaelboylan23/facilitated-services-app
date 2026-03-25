import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { ProjectDetails } from "./pages/ProjectDetails";
import { AssessmentPage } from "./pages/assessment/AssessmentPage";
import { Admin } from "./pages/admin/Admin";
import type { ReactNode } from "react";
import type { AppRole } from "./types";

function RequireAuth({ children, roles }: { children: ReactNode; roles?: AppRole[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route
          path="/projects/:id"
          element={<RequireAuth roles={["admin", "facilitator"]}><ProjectDetails /></RequireAuth>}
        />
        <Route
          path="/assessments/:id"
          element={<RequireAuth><AssessmentPage /></RequireAuth>}
        />
        <Route
          path="/admin"
          element={<RequireAuth roles={["admin"]}><Admin /></RequireAuth>}
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
