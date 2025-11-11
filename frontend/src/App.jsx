import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Header from "./components/Header";
import Accueil from "./pages/Accueil";
import EmployeeDashboard from "./components/employes/EmployeeDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // 🧠 Load user from storage on first render
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");

    if (token && storedRole && storedUser) {
      setRole(storedRole);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 🧭 Watch for role changes and redirect automatically
  useEffect(() => {
    if (role === "employe") navigate("/employe");
    if (role === "admin") navigate("/admin");
  }, [role]);

  // 🧹 Logout logic
  const handleLogout = async () => {
    try {
      const endpoint =
        "/" + (role === "admin" ? "admin" : "employe") + "/logout";
      await fetch(import.meta.env.VITE_API_URL + endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (err) {
      console.error(err);
    }
    localStorage.clear();
    setUser(null);
    setRole(null);
    navigate("/login");
  };

  // ✅ Callback to update parent state when login succeeds
  const handleLoginSuccess = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
  };

  return (
    <div style={{ marginTop: "90px" }}>
      <Header user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/register"
          element={<Register onRegisterSuccess={handleLoginSuccess} />}
        />


        {/* Protected routes */}
        <Route
          path="/employe"
          element={
            role === "employe" ? (
              <EmployeeDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
