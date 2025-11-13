import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ReservationDetailsModal({ show, onClose, reservation }) {
  if (!reservation) return null;

  // Compute end time
  const addMinutes = (start, minutes) => {
    const [h, m] = start.split(":").map(Number);
    const base = new Date();
    base.setHours(h, m, 0, 0);
    base.setMinutes(base.getMinutes() + minutes);
    return base.toTimeString().slice(0, 5);
  };

  const endTime = addMinutes(reservation.heure_res, reservation.duree_minutes);

  const formatDuration = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (m === 0) return `${h}h`;
    if (h === 0) return `${m}min`;
    return `${h}h ${m}min`;
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-dark text-light">
        <Modal.Title>
          🔍 Détails Réservation #{reservation.id}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-dark text-light">

        <div className="p-2">
          <p><strong>Salle:</strong> {reservation.salle?.code || reservation.num_salle}</p>
          <p><strong>Date:</strong> {reservation.date_res}</p>

          <p>
            <strong>Heure début:</strong> {reservation.heure_res}<br />
            <strong>Heure fin:</strong> {endTime}
          </p>

          <p>
            <strong>Durée:</strong> {formatDuration(reservation.duree_minutes)}
          </p>

          <p>
            <strong>Employé:</strong>{" "}
            {reservation.employe
              ? `${reservation.employe.prenom} ${reservation.employe.nom}`
              : "Inconnu"}
          </p>

          <p>
            <strong>Statut:</strong>{" "}
            <span className="badge bg-info text-dark" style={{ textTransform: "capitalize" }}>
              {reservation.statut}
            </span>
          </p>
        </div>

      </Modal.Body>

      <Modal.Footer className="bg-dark text-light">
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
