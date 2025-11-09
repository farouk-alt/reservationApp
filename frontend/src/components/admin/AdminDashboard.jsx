import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import SallesList from "./SalleList";
import EmployesList from "./EmployesList";
import AdminProfile from "./Profile";
import AdminStats from "./Stats";

export default function AdminDashboard() {
  const [active, setActive] = useState("stats");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
        minHeight: "100vh",
        color: "#E2E8F0",
        display: "flex",
      }}
    >
      <AdminSidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        style={{
          marginLeft: collapsed ? "80px" : "230px",
          transition: "margin-left 0.3s ease",
          padding: "30px 25px",
          width: collapsed ? "calc(100vw - 80px)" : "calc(100vw - 230px)",
        }}
      >
        {active === "stats" && <AdminStats />}
        {active === "salles" && <SallesList />}
        {active === "employes" && <EmployesList />}
        {active === "profile" && <AdminProfile />}
      </div>
    </div>
  );
}
