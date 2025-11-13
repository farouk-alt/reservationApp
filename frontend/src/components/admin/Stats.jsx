import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

export default function AdminStats() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/reservations").then((res) => {
      setData(computeStats(res.data));
    });
  }, []);

  if (!data) return <p className="text-light">Chargement...</p>;

  const card = {
    background: "rgba(15,23,42,0.95)",
    borderRadius: "15px",
    border: "1px solid rgba(56,189,248,0.25)",
    padding: "20px",
    color: "#E2E8F0",
  };
  

  const COLORS = ["#38BDF8", "#4ADE80", "#FBBF24", "#F87171", "#A78BFA", "#F472B6"];

  return (
    <div style={{ paddingBottom: "50px" }}>
      <h3 className="fw-bold mb-4" style={{ color: "#38BDF8" }}>
        📊 Dashboard Administrateur — Analytics Global
      </h3>

      {/* KPIs */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3"><KPI title="Total Salles" value={data.totalSalles} color="#38BDF8" /></div>
        <div className="col-md-3 mb-3"><KPI title="Employés" value={data.totalEmployees} color="#4ADE80" /></div>
        <div className="col-md-3 mb-3"><KPI title="Admins" value={data.totalAdmins} color="#F472B6" /></div>
        <div className="col-md-3 mb-3"><KPI title="Réservations" value={data.totalReservations} color="#FBBF24" /></div>
      </div>

      {/* Row 2 */}
      <div className="row mb-5">
        <div className="col-md-4 mb-3"><KPI title="Salles actives" value={data.activeSalles} color="#4ADE80" /></div>
        <div className="col-md-4 mb-3"><KPI title="Salles inactives" value={data.inactiveSalles} color="#F87171" /></div>
        <div className="col-md-4 mb-3"><KPI title="Annulations" value={data.cancelled} color="#F87171" /></div>
      </div>

      {/* Trends */}
      <div className="row mb-5">
        <div className="col-md-8">
          <SectionTitle title="📈 Évolution mensuelle des réservations" />
          <ChartLineMonthly data={data.monthlyTrend} />
        </div>

        <div className="col-md-4">
          <SectionTitle title="🔥 Jours les plus chargés" />
          <BarWeekday data={data.perWeekday} />
        </div>
      </div>

      {/* Salle performance */}
      <div className="row mb-5">
        <div className="col-md-6">
          <SectionTitle title="🏢 Réservations par salle" />
          <ChartPerSalle data={data.perSalle} />
        </div>

        <div className="col-md-6">
          <SectionTitle title="📌 Occupation (%) par salle" />
          <SalleRadar data={data.occupancyPercent} />
        </div>
      </div>

      {/* Status breakdown */}
      <div className="row mb-5">
        <div className="col-md-4">
          <SectionTitle title="✔ Statut des réservations" />
          <StatusPie data={data.statusBreakdown} />
        </div>

        <div className="col-md-8">
          <SectionTitle title="🔥 Activité des 60 derniers jours" />
          <Heatmap data={data.heatmap} />
        </div>
      </div>

      {/* Top employees */}
      <div className="row mb-5">
        <div className="col-md-12">
          <SectionTitle title="🏆 Employés les plus actifs" />
          <TopEmployees data={data.topEmployees} />
        </div>
      </div>

    </div>
  );
}

/* ----------------------------------------------------------
   COMPUTE ALL STATISTICS HERE
---------------------------------------------------------- */
function computeStats(all) {
  const out = {};

  out.totalReservations = all.length;
  out.totalEmployees = new Set(all.map((r) => r.num_emp)).size;
  out.totalSalles = new Set(all.map((r) => r.num_salle)).size;
  out.totalAdmins = 3; // you can compute from /admin/list

  out.activeSalles = all.filter((r) => r.salle?.statut === "active").length;
  out.inactiveSalles = out.totalSalles - out.activeSalles;

  out.cancelled = all.filter((r) => r.statut === "annulée").length;

  // Monthly trend
  const map = {};
  all.forEach((r) => {
    const m = r.date_res.slice(0, 7);
    map[m] = (map[m] || 0) + 1;
  });
  out.monthlyTrend = Object.entries(map).map(([month, count]) => ({ month, count }));

  // Per salle
  const salleMap = {};
  all.forEach((r) => {
    const c = r.salle?.code || "Salle";
    salleMap[c] = (salleMap[c] || 0) + 1;
  });
  out.perSalle = Object.entries(salleMap).map(([salle, count]) => ({ salle, count }));

  // Per weekday
  const wdMap = { 0: 0, 1:0,2:0,3:0,4:0,5:0,6:0 };
  all.forEach((r) => {
    const d = new Date(r.date_res).getDay();
    wdMap[d]++;
  });
  out.perWeekday = Object.entries(wdMap).map(([day, count]) => ({
    day: ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][day],
    count,
  }));

  // Status breakdown
  const stMap = {};
  all.forEach((r) => {
    stMap[r.statut] = (stMap[r.statut] || 0) + 1;
  });
  out.statusBreakdown = Object.entries(stMap).map(([statut, count]) => ({ statut, count }));

  // Top employees
  const empMap = {};
  all.forEach((r) => {
    const n = r.employe ? `${r.employe.prenom} ${r.employe.nom}` : `EMP#${r.num_emp}`;
    empMap[n] = (empMap[n] || 0) + 1;
  });
  out.topEmployees = Object.entries(empMap)
    .map(([employee, count]) => ({ employee, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // Heatmap (60 days)
  const map2 = {};
  all.forEach((r) => {
    map2[r.date_res] = (map2[r.date_res] || 0) + 1;
  });

  const arr = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    arr.push({
      date: iso,
      count: map2[iso] || 0,
      label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    });
  }
  out.heatmap = arr;

  // Occupancy percentage
  const occMap = {};
  all.forEach((r) => {
    const salle = r.salle?.code || "Salle";
    const min = r.duree_minutes ?? r.duree * 60;
    occMap[salle] = (occMap[salle] || 0) + min;
  });

  out.occupancyPercent = Object.entries(occMap).map(([salle, minutes]) => ({
    salle,
    percentage: Math.min(100, ((minutes / (30 * 9 * 60)) * 100).toFixed(1)), // sample formula
  }));

  return out;
}

/* ----------------------------------------------------------
   UI COMPONENTS — KPI, CHARTS, TITLES
---------------------------------------------------------- */

function KPI({ title, value, color }) {
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.95)",
        border: `1px solid ${color}`,
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div className="small" style={{ color: "#E2E8F0" }}>{title}</div>
      <div className="fs-2 fw-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h5 className="fw-bold mb-3" style={{ color: "#38BDF8" }}>
      {title}
    </h5>
  );
}

/* LINE CHART */
function ChartLineMonthly({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
        <XAxis dataKey="month" stroke="#E2E8F0" />
        <YAxis stroke="#E2E8F0" />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#38BDF8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* BAR CHART SALLE */
function ChartPerSalle({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="salle" stroke="#E2E8F0" />
        <YAxis stroke="#E2E8F0" />
        <Tooltip />
        <Bar dataKey="count" fill="#38BDF8" radius={[10,10,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* WEEKDAY BAR */
function BarWeekday({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" stroke="#E2E8F0" />
        <YAxis stroke="#E2E8F0" />
        <Tooltip />
        <Bar dataKey="count" fill="#FBBF24" radius={[10,10,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* STATUS PIE */
function StatusPie({ data }) {
  const COLORS = ["#4ADE80", "#F87171", "#60A5FA", "#FBBF24"];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="statut"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* RADAR — OCCUPANCY */
function SalleRadar({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="salle" stroke="#E2E8F0" />
        <PolarRadiusAxis stroke="#E2E8F0" />
        <Radar dataKey="percentage" fill="#38BDF8" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/* HEATMAP */
function Heatmap({ data }) {
  const color = (c) => {
    if (c === 0) return "#1e293b";
    if (c === 1) return "#38bdf8";
    if (c <= 3) return "#0ea5e9";
    return "#0369a1";
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(10, 1fr)",
        gap: "4px",
      }}
    >
      {data.map((d) => (
        <div
          key={d.date}
          title={`${d.label}: ${d.count}`}
          style={{
            width: "100%",
            paddingTop: "100%",
            backgroundColor: color(d.count),
            borderRadius: "6px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "0.6rem",
              opacity: d.count === 0 ? 0.3 : 1,
            }}
          >
            {new Date(d.date).getDate()}
          </div>
        </div>
      ))}
    </div>
  );
}

/* TOP EMPLOYEES */
function TopEmployees({ data }) {
  return (
    <ul className="list-group">
      {data.map((e) => (
        <li
          key={e.employee}
          className="list-group-item"
          style={{
            background: "#0f172a",
            color: "#E2E8F0",
            border: "1px solid rgba(56,189,248,0.2)",
          }}
        >
          <strong>{e.employee}</strong> — {e.count} réservations
        </li>
      ))}
    </ul>
  );
}
