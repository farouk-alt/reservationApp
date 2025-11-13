import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import Accueil from "./pages/Accueil";
import EmployeeDashboard from "./components/employes/EmployeeDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  /* ---------------------------------------------
     1️⃣ Prevent unauthorized access on first load
  ----------------------------------------------*/
  useEffect(() => {
    const token = localStorage.getItem("token");
    const path = window.location.pathname;

    // Protected routes
    const protectedRoutes = ["/employe", "/admin"];

    if (!token && protectedRoutes.includes(path)) {
      navigate("/", { replace: true });
    }
  }, []);

  /* ---------------------------------------------------------
     2️⃣ Load user & role from localStorage on first load
  ----------------------------------------------------------*/
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");

    if (token && storedRole && storedUser) {
      setRole(storedRole);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /* -------------------------------------------------------
     3️⃣ Auto-redirect after login (only from public pages)
  --------------------------------------------------------*/
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !role) return;

    const path = window.location.pathname;
    const publicPages = ["/", "/login", "/register"];

    if (publicPages.includes(path)) {
      if (role === "employe") navigate("/employe", { replace: true });
      if (role === "admin") navigate("/admin", { replace: true });
    }
  }, [role]);

  /* -------------------------------------------------------
     4️⃣ Validate token with backend (logout if invalid)
  --------------------------------------------------------*/
  useEffect(() => {
    async function validate() {
      const token = localStorage.getItem("token");
      const r = localStorage.getItem("role");

      if (!token || !r) return;

      const endpoint = r === "admin" ? "/admin/profile" : "/employe/profile";

      try {
        await fetch(import.meta.env.VITE_API_URL + endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        console.log("❌ Invalid token, logging out...");
        localStorage.clear();
        setUser(null);
        setRole(null);
        navigate("/login", { replace: true });
      }
    }

    validate();
  }, []);

  /* ---------------------------------------------
     5️⃣ Logout
  ----------------------------------------------*/
  const handleLogout = async () => {
    try {
      const endpoint = "/" + (role === "admin" ? "admin" : "employe") + "/logout";

      await fetch(import.meta.env.VITE_API_URL + endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch (err) {
      console.error(err);
    }

    localStorage.clear();
    setUser(null);
    setRole(null);
    navigate("/login", { replace: true });
  };

  /* ---------------------------------------------
     6️⃣ Login success callback
  ----------------------------------------------*/
  const handleLoginSuccess = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
  };

  return (
    <div style={{ marginTop: "90px" }}>
      <Header user={user} onLogout={handleLogout} />
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register onRegisterSuccess={handleLoginSuccess} />} />

        {/* Protected routes */}
        <Route
          path="/employe"
          element={role === "employe" ? <EmployeeDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin"
          element={role === "admin" ? <AdminDashboard /> : <Navigate to="/login" replace />}
        />

        {/* Password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
