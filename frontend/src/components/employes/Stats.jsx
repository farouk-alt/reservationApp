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
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function Stats() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("/reservations");
      setReservations(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques :", err);
    }
  };

  // ---------- Helpers ----------
  const COLORS = ["#38BDF8", "#2563EB", "#4ADE80", "#FBBF24", "#F97316", "#F87171"];

  const formatDuration = (min) => {
    if (!min && min !== 0) return "-";
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0 && m === 0) return "0";
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  };

  const getWorkingMinutesCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    let totalMinutes = 0;
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay(); // 0 = Sunday
      if (dayOfWeek === 0) continue; // skip Sunday
      // Workday: 08:00 -> 17:00 (9h)
      totalMinutes += 9 * 60;
    }
    return totalMinutes;
  };

  const today = new Date();

  // ---------- 1) Weekly Reservations (last 7 days) ----------
  const weeklyData = (() => {
    const map = {};
    reservations.forEach((r) => {
      if (!r.date_res) return;
      map[r.date_res] = (map[r.date_res] || 0) + 1;
    });

    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      arr.push({
        date: iso,
        label: d.toLocaleDateString("fr-FR", {
          weekday: "short",
          day: "2-digit",
        }),
        count: map[iso] || 0,
      });
    }
    return arr;
  })();

  // ---------- 2) Top Employees ----------
  const topEmployees = (() => {
    const countMap = {};
    reservations.forEach((r) => {
      const name = r.employe
        ? `${r.employe.prenom} ${r.employe.nom}`
        : `Employé #${r.num_emp}`;
      countMap[name] = (countMap[name] || 0) + 1;
    });

    const arr = Object.entries(countMap).map(([employee, count]) => ({
      employee,
      count,
    }));
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 5);
  })();

  // ---------- 3) Peak Hours (per hour) ----------
  const perHour = (() => {
    const hourMap = {};
    reservations.forEach((r) => {
      if (!r.heure_res) return;
      const hour = parseInt(r.heure_res.slice(0, 2), 10);
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    const arr = [];
    for (let h = 8; h <= 17; h++) {
      arr.push({
        hour: `${String(h).padStart(2, "0")}:00`,
        count: hourMap[h] || 0,
      });
    }
    return arr;
  })();

  // ---------- 4) Busiest Day of Week ----------
  const perWeekday = (() => {
    const weekdayMap = {
      1: { label: "Lundi", count: 0 },
      2: { label: "Mardi", count: 0 },
      3: { label: "Mercredi", count: 0 },
      4: { label: "Jeudi", count: 0 },
      5: { label: "Vendredi", count: 0 },
      6: { label: "Samedi", count: 0 },
      0: { label: "Dimanche", count: 0 },
    };

    reservations.forEach((r) => {
      if (!r.date_res) return;
      const d = new Date(r.date_res);
      const dow = d.getDay();
      if (!weekdayMap[dow]) return;
      weekdayMap[dow].count += 1;
    });

    return Object.entries(weekdayMap).map(([key, v]) => ({
      day: v.label,
      count: v.count,
      dow: parseInt(key, 10),
    }));
  })();

  const busiestDay = perWeekday.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    { day: "-", count: 0 }
  );

  // ---------- 5) Duration distribution ----------
  const durationBuckets = (() => {
    const buckets = {
      "0–30": 0,
      "30–60": 0,
      "60–120": 0,
      ">120": 0,
    };

    reservations.forEach((r) => {
      const min = r.duree_minutes ?? (r.duree ? r.duree * 60 : 0);
      if (min <= 30) buckets["0–30"]++;
      else if (min <= 60) buckets["30–60"]++;
      else if (min <= 120) buckets["60–120"]++;
      else buckets[">120"]++;
    });

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  })();

  // ---------- 6) Occupancy per salle (total minutes) ----------
  const occupancyPerSalle = (() => {
    const minutesMap = {};
    reservations.forEach((r) => {
      const salleCode = r.salle?.code || "Inconnue";
      const min = r.duree_minutes ?? (r.duree ? r.duree * 60 : 0);
      minutesMap[salleCode] = (minutesMap[salleCode] || 0) + min;
    });

    return Object.entries(minutesMap).map(([salle, minutes]) => ({
      salle,
      minutes,
      hours: +(minutes / 60).toFixed(1),
    }));
  })();

  // ---------- 7) Occupancy percentage (current month) ----------
  const occupancyPercentage = (() => {
    const workingMinutes = getWorkingMinutesCurrentMonth();
    if (workingMinutes === 0) return [];

    const salleMinutes = {};
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    reservations.forEach((r) => {
      if (!r.date_res) return;
      const d = new Date(r.date_res);
      if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth)
        return;

      const salleCode = r.salle?.code || "Inconnue";
      const min = r.duree_minutes ?? (r.duree ? r.duree * 60 : 0);
      salleMinutes[salleCode] = (salleMinutes[salleCode] || 0) + min;
    });

    return Object.entries(salleMinutes).map(([salle, minutes]) => ({
      salle,
      percentage: +((minutes / workingMinutes) * 100).toFixed(1),
    }));
  })();

  // ---------- 8) Upcoming reservations timeline ----------
  const upcoming = (() => {
    const now = new Date();
    const items = reservations
      .map((r) => {
        if (!r.date_res || !r.heure_res) return null;
        const dt = new Date(`${r.date_res}T${r.heure_res}`);
        return { ...r, dt };
      })
      .filter((r) => r && r.dt >= now)
      .sort((a, b) => a.dt - b.dt)
      .slice(0, 10);

    return items;
  })();

  // ---------- 9) Cancellation rate ----------
  const cancelData = (() => {
    const total = reservations.length;
    const cancelled = reservations.filter((r) => r.statut === "annulée").length;
    const active = total - cancelled;
    return [
      { name: "Annulée", value: cancelled },
      { name: "Non annulée", value: active },
    ];
  })();

  // ---------- 10) Success vs other statuses ----------
  const statusBreakdown = (() => {
    const map = {};
    reservations.forEach((r) => {
      const st = r.statut || "inconnu";
      map[st] = (map[st] || 0) + 1;
    });
    return Object.entries(map).map(([statut, count]) => ({
      statut,
      count,
    }));
  })();

  // ---------- 11) Average duration ----------
  const avgDurationMinutes = (() => {
    if (reservations.length === 0) return 0;
    let totalMin = 0;
    reservations.forEach((r) => {
      totalMin += r.duree_minutes ?? (r.duree ? r.duree * 60 : 0);
    });
    return Math.round(totalMin / reservations.length);
  })();

  // ---------- 12) Calendar heatmap (last 60 days) ----------
  const heatmapDays = (() => {
    const map = {};
    reservations.forEach((r) => {
      if (!r.date_res) return;
      map[r.date_res] = (map[r.date_res] || 0) + 1;
    });

    const arr = [];
    for (let i = 59; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      arr.push({
        date: iso,
        label: d.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        }),
        count: map[iso] || 0,
      });
    }
    return arr;
  })();

  const heatColor = (count) => {
    if (count === 0) return "#020617";         // dark
    if (count === 1) return "#0f766e";         // low
    if (count <= 3) return "#14b8a6";          // medium
    if (count <= 6) return "#22c55e";          // high
    return "#ef4444";                          // very high
  };

  return (
    <div
      style={{
        background: "rgba(30,41,59,0.9)",
        color: "#E2E8F0",
        padding: "30px",
        borderRadius: "15px",
        border: "1px solid rgba(56,189,248,0.2)",
      }}
    >
      <h3 className="fw-bold mb-4" style={{ color: "#38BDF8" }}>
        📊 Statistiques des Réservations
      </h3>

      {/* ---- Row 0: KPIs ---- */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div
            className="p-3 rounded-3"
            style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(56,189,248,0.3)" }}
          >
            <div className="small text-slate-400">Total réservations</div>
            <div className="fs-3 fw-bold">{reservations.length}</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div
            className="p-3 rounded-3"
            style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(56,189,248,0.3)" }}
          >
            <div className="small text-slate-400">Jour le plus chargé</div>
            <div className="fw-bold">
              {busiestDay.day} ({busiestDay.count})
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div
            className="p-3 rounded-3"
            style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(56,189,248,0.3)" }}
          >
            <div className="small text-slate-400">Durée moyenne</div>
            <div className="fw-bold">{formatDuration(avgDurationMinutes)}</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div
            className="p-3 rounded-3"
            style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(56,189,248,0.3)" }}
          >
            <div className="small text-slate-400">Annulations</div>
            <div className="fw-bold">
              {cancelData[0].value} / {reservations.length}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Row 1: Weekly + Upcoming ---- */}
      <div className="row mb-4">
        <div className="col-md-8 mb-4">
          <h5 className="text-info">📆 Réservations (7 derniers jours)</h5>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey="label" stroke="#E2E8F0" />
              <YAxis stroke="#E2E8F0" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#38BDF8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-4 mb-4">
          <h5 className="text-info">⏳ Prochaines réservations</h5>
          <div
            style={{
              maxHeight: "260px",
              overflowY: "auto",
              background: "rgba(15,23,42,0.95)",
              borderRadius: "12px",
              padding: "10px",
              border: "1px solid rgba(56,189,248,0.3)",
            }}
          >
            {upcoming.length === 0 && (
              <div className="small text-muted">Aucune réservation à venir.</div>
            )}
            {upcoming.map((r) => (
              <div
                key={r.id}
                className="p-2 mb-2 rounded"
                style={{
                  background: "rgba(15,23,42,0.9)",
                  borderLeft: "3px solid #38BDF8",
                }}
              >
                <div className="fw-semibold">
                  {r.date_res} à {r.heure_res.slice(0, 5)} — {r.salle?.code || r.num_salle}
                </div>
                <div className="small">
                  {r.employe ? `${r.employe.prenom} ${r.employe.nom}` : "—"}
                </div>
                <div className="small text-muted">Statut : {r.statut}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Row 2: per Salle + Top Employees ---- */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <h5 className="text-info">🏢 Nombre de réservations par salle</h5>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={(() => {
                const salleCount = {};
                reservations.forEach((r) => {
                  const c = r.salle?.code || "Inconnue";
                  salleCount[c] = (salleCount[c] || 0) + 1;
                });
                return Object.entries(salleCount).map(([salle, count]) => ({
                  salle,
                  count,
                }));
              })()}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="salle" stroke="#E2E8F0" />
              <YAxis stroke="#E2E8F0" />
              <Tooltip />
              <Bar dataKey="count" fill="#38BDF8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-6 mb-4">
          <h5 className="text-info">👤 Employés les plus actifs</h5>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topEmployees}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="employee" stroke="#E2E8F0" tick={{ fontSize: 10 }} />
              <YAxis stroke="#E2E8F0" />
              <Tooltip />
              <Bar dataKey="count" fill="#4ADE80" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Row 3: Peak hours + Busiest weekday ---- */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <h5 className="text-info">⏰ Heures les plus occupées</h5>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={perHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey="hour" stroke="#E2E8F0" />
              <YAxis stroke="#E2E8F0" />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-6 mb-4">
          <h5 className="text-info">📅 Jours les plus chargés</h5>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={perWeekday}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey="day" stroke="#E2E8F0" />
              <YAxis stroke="#E2E8F0" />
              <Tooltip />
              <Bar dataKey="count" fill="#FBBF24" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Row 4: Duration + Cancellation pie ---- */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <h5 className="text-info">⏳ Distribution des durées</h5>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={durationBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey="range" stroke="#E2E8F0" />
              <YAxis stroke="#E2E8F0" />
              <Tooltip />
              <Bar dataKey="count" fill="#F97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-6 mb-4">
          <h5 className="text-info">🚫 Taux d'annulation</h5>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={cancelData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {cancelData.map((entry, index) => (
                  <Cell
                    key={`cancel-cell-${index}`}
                    fill={index === 0 ? "#F87171" : "#22c55e"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Row 5: Occupancy per salle + % ---- */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <h5 className="text-info">⏱️ Temps total réservé par salle (heures)</h5>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={occupancyPerSalle}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey="salle" stroke="#E2E8F0" />
              <YAxis stroke="#E2E8F0" />
              <Tooltip />
              <Bar dataKey="hours" fill="#38BDF8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-6 mb-4">
          <h5 className="text-info">
            📈 Taux d'occupation des salles (mois en cours)
          </h5>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={occupancyPercentage}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey="salle" stroke="#E2E8F0" />
              <YAxis stroke="#E2E8F0" unit="%" />
              <Tooltip />
              <Bar dataKey="percentage" fill="#4ADE80" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Row 6: Status breakdown + Heatmap ---- */}
      <div className="row mb-4">
        <div className="col-md-4 mb-4">
          <h5 className="text-info">✅ Statuts des réservations</h5>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusBreakdown}
                dataKey="count"
                nameKey="statut"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {statusBreakdown.map((entry, index) => (
                  <Cell
                    key={`status-cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-8 mb-4">
          <h5 className="text-info">🔥 Heatmap d'activité (60 derniers jours)</h5>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(10, 1fr)",
              gap: "4px",
              background: "#020617",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid rgba(148,163,184,0.5)",
            }}
          >
            {heatmapDays.map((d) => (
              <div
                key={d.date}
                title={`${d.label} : ${d.count} réservation(s)`}
                style={{
                  width: "100%",
                  paddingTop: "100%",
                  position: "relative",
                  borderRadius: "4px",
                  backgroundColor: heatColor(d.count),
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6rem",
                    color: "#e5e7eb",
                    opacity: d.count === 0 ? 0.3 : 1,
                  }}
                >
                  {new Date(d.date).getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
