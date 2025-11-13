// frontend/src/components/employees/SalleCalendarModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../api/axios";

/* -----------------------------------------------------
   🧠 HELPERS (Date utils, formatters, range calculations)
------------------------------------------------------ */

// add hours to HH:MM
const addMinutes = (start, minutes) => {
  const [h, m] = start.split(":").map(Number);
  const base = new Date();
  base.setHours(h, m, 0, 0);
  base.setMinutes(base.getMinutes() + minutes);
  return base.toTimeString().slice(0, 5);
};


// show “08:00 → 10:00”
const formatRange = (r) => {
  const end = addMinutes(r.heure_res, r.duree_minutes);
  return `${r.heure_res.slice(0, 5)} → ${end}`;
};

// “Lun 14/11”
const formatDateLabel = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
};

// Monday of current week
const getMonday = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay(); // Sunday=0
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};

// Add n days
const addDays = (dateStr, n) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Build full 6×7 month grid like Google Calendar
const getMonthMatrix = (current) => {
  const date = new Date(current);
  const year = date.getFullYear();
  const month = date.getMonth();

  // first day of month
  const firstOfMonth = new Date(year, month, 1);
  let start = getMonday(firstOfMonth.toISOString().slice(0, 10));

  const matrix = [];
  for (let week = 0; week < 6; week++) {
    const row = [];
    for (let day = 0; day < 7; day++) {
      row.push(addDays(start, week * 7 + day));
    }
    matrix.push(row);
  }
  return matrix;
};

/* -----------------------------------------------------
   📅 MAIN COMPONENT
------------------------------------------------------ */

export default function SalleCalendarModal({ show, onClose, salle }) {
  const [view, setView] = useState("day"); // "day" | "week" | "month"
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [allEvents, setAllEvents] = useState([]);

  // Load ALL salle reservations once
  useEffect(() => {
    if (!salle) return;

    axios
      .get(`/salles/${salle.id}/calendar/all`)
      .then((res) => setAllEvents(res.data || []))
      .catch(() => setAllEvents([]));
  }, [salle]);

  /* -----------------------------
     🔍 FILTERED EVENTS (FAST)
  ------------------------------ */

  const dayEvents = allEvents.filter((e) => e.date_res === selectedDate);

  // WEEK VIEW LOCAL CALCULATION
  const monday = getMonday(selectedDate);
  const weekEvents = {};
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    weekEvents[d] = allEvents.filter((e) => e.date_res === d);
  }

  // MONTH VIEW LOCAL CALCULATION
  const monthMatrix = getMonthMatrix(selectedDate);
  const monthEvents = {};
  monthMatrix.flat().forEach((date) => {
    monthEvents[date] = allEvents.filter((e) => e.date_res === date);
  });

  const monthLabel = new Date(selectedDate).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  if (!salle) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-dark text-light">
        <Modal.Title>📅 Planning — Salle {salle.code}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-dark text-light">

        {/* 🔽 Switch View + Date Picker */}
        <div className="d-flex align-items-center mb-3 gap-2">
          <div className="btn-group">
            <button
              className={`btn btn-sm ${
                view === "day" ? "btn-info" : "btn-outline-info"
              }`}
              onClick={() => setView("day")}
            >
              Jour
            </button>
            <button
              className={`btn btn-sm ${
                view === "week" ? "btn-info" : "btn-outline-info"
              }`}
              onClick={() => setView("week")}
            >
              Semaine
            </button>
            <button
              className={`btn btn-sm ${
                view === "month" ? "btn-info" : "btn-outline-info"
              }`}
              onClick={() => setView("month")}
            >
              Mois
            </button>
          </div>

          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="ms-3"
            style={{
              maxWidth: "200px",
              background: "#020617",
              color: "#E2E8F0",
              border: "1px solid rgba(56,189,248,0.5)",
            }}
          />
        </div>

        {/* --------------------------
            🟦 DAY VIEW (Google style)
        --------------------------- */}
        {view === "day" && (
          <div>
            {dayEvents.length === 0 ? (
              <p style={{ color:"white" }}>Aucune réservation ce jour.</p>
            ) : (
              dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2 mb-2 rounded"
                  style={{
                    background: "rgba(15,23,42,0.9)",
                    borderLeft: "3px solid #38BDF8",
                  }}
                >
                  <div className="fw-semibold">{formatRange(evt)}</div>
                  <div className="small">
                    {evt.employe
                      ? `${evt.employe.prenom} ${evt.employe.nom}`
                      : "Employé inconnu"}
                  </div>
                  <div className="small text-muted">
                    <span style={{color:"white"}}>Statut :</span> <strong style={{color:"white"}}>{evt.statut}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --------------------------
            🟩 WEEK VIEW (Google grid)
        --------------------------- */}
        {view === "week" && (
          <div
            style={{
              overflowX: "auto",
              borderRadius: "10px",
              border: "1px solid rgba(148,163,184,0.4)",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "80px repeat(7, 1fr)",
                background: "#020617",
              }}
            >
              <div></div>
              {Array.from({ length: 7 }).map((_, i) => {
                const d = addDays(monday, i);
                return (
                  <div
                    key={d}
                    className="text-center py-2"
                    style={{ borderLeft: "1px solid #1f2937" }}
                  >
                    {formatDateLabel(d)}
                  </div>
                );
              })}
            </div>

            {/* Time rows */}
            {Array.from({ length: 13 }).map((_, rowIndex) => {
              const hour = 8 + rowIndex;
              const label = `${String(hour).padStart(2, "0")}:00`;

              return (
                <div
                  key={hour}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px repeat(7, 1fr)",
                    minHeight: "46px",
                  }}
                >
                  <div
                    className="text-end pe-2 small text-muted"
                    style={{
                      borderRight: "1px solid #1f2937",
                      paddingTop: "4px",
                    }}
                  >
                    {label}
                  </div>

                  {Array.from({ length: 7 }).map((_, colIndex) => {
                    const d = addDays(monday, colIndex);
                    const events = weekEvents[d].filter(
                      (ev) => parseInt(ev.heure_res.slice(0, 2), 10) === hour
                    );

                    return (
                      <div
                        key={d + hour}
                        style={{
                          borderLeft: "1px solid #1f2937",
                          padding: "2px 3px",
                        }}
                      >
                        {events.map((ev) => (
                          <div
                            key={ev.id}
                            className="rounded px-1 py-1 mb-1"
                            style={{
                              background: "rgba(56,189,248,0.25)",
                              fontSize: "0.75rem",
                            }}
                          >
                            {formatRange(ev)}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* --------------------------
            🟥 MONTH VIEW (Google grid)
        --------------------------- */}
        {view === "month" && (
          <>
            <h6 className="fw-bold mb-3">{monthLabel}</h6>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "3px",
              }}
            >
              {/* WEEKDAY HEADERS */}
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                <div key={d} className="text-center text-muted small">
                  {d}
                </div>
              ))}

              {/* DAYS MATRIX */}
              {monthMatrix.map((week, wi) =>
                week.map((date) => {
                  const dObj = new Date(date);
                  const inMonth =
                    dObj.getMonth() === new Date(selectedDate).getMonth();
                  const events = monthEvents[date] || [];

                  return (
                    <div
                      key={`${wi}-${date}`}
                      className="p-1 rounded"
                      style={{
                        minHeight: "80px",
                        background: inMonth
                          ? "rgba(15,23,42,0.9)"
                          : "rgba(15,23,42,0.4)",
                        border: "1px solid rgba(30,64,175,0.4)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                      onClick={() => {
                        setSelectedDate(date);
                        setView("day");
                      }}
                    >
                      <div className="d-flex justify-content-between mb-1">
                        <span
                          style={{
                            color: inMonth ? "#e5e7eb" : "#6b7280",
                          }}
                        >
                          {dObj.getDate()}
                        </span>

                        {events.length > 0 && (
                          <span className="badge bg-info">{events.length}</span>
                        )}
                      </div>

                      {/* Show up to 2 events */}
                      {events.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className="rounded px-1 py-1 mb-1"
                          style={{
                            background: "rgba(56,189,248,0.25)",
                            fontSize: "0.65rem",
                          }}
                        >
                          {ev.heure_res.slice(0, 5)} •{" "}
                          {ev.employe
                            ? `${ev.employe.prenom} ${ev.employe.nom}`
                            : "—"}
                        </div>
                      ))}

                      {events.length > 2 && (
                        <div className="text-muted small">
                          +{events.length - 2} autres
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-dark text-light">
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>

      {/* White calendar icon */}
      <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
          }
        `}
      </style>
    </Modal>
  );
}
