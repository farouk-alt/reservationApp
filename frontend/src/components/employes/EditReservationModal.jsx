import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function EditReservationModal({ show, onClose, reservation, onSave }) {
  const [form, setForm] = useState({
    date_res: "",
    heure_res: "",
    duree: "",
  });

  useEffect(() => {
    if (reservation) {
      setForm({
        date_res: reservation.date_res,
        heure_res: reservation.heure_res,
        duree: reservation.duree,
      });
    }
  }, [reservation]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.date_res || !form.heure_res || !form.duree) {
      alert("⚠️ Tous les champs sont obligatoires.");
      return;
    }
    onSave(form);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-dark text-light">
        <Modal.Title>Modifier Réservation #{reservation?.id}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-dark text-light">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date_res"
              value={form.date_res}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Heure de début</Form.Label>
            <Form.Control
              type="time"
              name="heure_res"
              value={form.heure_res}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Durée (heures)</Form.Label>
            <Form.Control
              type="number"
              name="duree"
              min="1"
              max="6"
              value={form.duree}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="bg-dark text-light">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          💾 Enregistrer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
