import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

const SalleModal = forwardRef(({ onSave }, ref) => {
  const modalRef = useRef(null);
  const bsModal = useRef(null);
  const [form, setForm] = useState({
    type: "",
    capacite: "",
    etage: "",
    lettre: "",
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const types = ["Salle de conférence", "Bureau", "Salle de formation"];
  const etages = [1, 2, 3, 4, 5];
  const lettres = ["A", "B", "C", "D", "E", "F"];

  // 🎯 Modal open/close behavior
  useImperativeHandle(ref, () => ({
    open: (data = null) => {
      if (data) {
        const etage = data.code ? data.code[0] : "";
        const lettre = data.code ? data.code.slice(1) : "";
        setForm({
          type: data.type || "",
          capacite: data.capacite || "",
          etage,
          lettre,
        });
        setEditingId(data.id || null);
      } else {
        setForm({ type: "", capacite: "", etage: "", lettre: "" });
        setEditingId(null);
      }
      setErrors({});
      bsModal.current = new window.bootstrap.Modal(modalRef.current);
      bsModal.current.show();
    },
  }));

  useEffect(() => {
    return () => {
      try {
        bsModal.current?.dispose();
      // eslint-disable-next-line no-unused-vars
      } catch (e) { /* empty */ }
    };
  }, []);

  // ✅ Validation
  const validate = () => {
    const errs = {};
    if (!form.type) errs.type = "Veuillez choisir le type de salle.";
    if (!form.etage) errs.etage = "Veuillez choisir un étage.";
    if (!form.lettre) errs.lettre = "Veuillez choisir une lettre.";
    const cap = parseInt(form.capacite, 10);
    if (Number.isNaN(cap) || cap <= 0)
      errs.capacite = "La capacité doit être un nombre positif.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ✅ Save (send merged `code`)
  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);

    const code = `${form.etage}${form.lettre}`; // 🧩 Merge étage + lettre

    await onSave(
      {
        type: form.type,
        capacite: parseInt(form.capacite, 10),
        code, // send only code
      },
      editingId
    );

    setLoading(false);
    bsModal.current.hide();
  };

  return (
    <div
      className="modal fade"
      tabIndex="-1"
      ref={modalRef}
      aria-hidden="true"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content text-light"
          style={{
            background: "rgba(30,41,59,0.95)",
            borderRadius: "18px",
            border: "1px solid rgba(56,189,248,0.2)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
          }}
        >
          {/* 🧩 Header */}
          <div
            className="modal-header border-0"
            style={{
              borderBottom: "1px solid rgba(56,189,248,0.15)",
            }}
          >
            <h5 className="modal-title fw-bold" style={{ color: "#38BDF8" }}>
              {editingId ? "Modifier la salle" : "Ajouter une salle"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          {/* 📋 Body */}
          <div className="modal-body pb-2">
            {/* 🏷️ Type de salle */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-light">
                Type de salle
              </label>
              <select
                className={`form-select ${errors.type ? "is-invalid" : ""}`}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56,189,248,0.2)",
                }}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">-- Choisir un type --</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.type && (
                <div className="invalid-feedback">{errors.type}</div>
              )}
            </div>

            {/* 🧮 Capacité */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-light">
                Capacité
              </label>
              <input
                type="number"
                className={`form-control ${
                  errors.capacite ? "is-invalid" : ""
                }`}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56,189,248,0.2)",
                }}
                value={form.capacite}
                onChange={(e) =>
                  setForm({ ...form, capacite: e.target.value })
                }
              />
              {errors.capacite && (
                <div className="invalid-feedback">{errors.capacite}</div>
              )}
            </div>

            {/* 🏢 Étage */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-light">Étage</label>
              <select
                className={`form-select ${errors.etage ? "is-invalid" : ""}`}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56,189,248,0.2)",
                }}
                value={form.etage}
                onChange={(e) => setForm({ ...form, etage: e.target.value })}
              >
                <option value="">-- Choisir un étage --</option>
                {etages.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              {errors.etage && (
                <div className="invalid-feedback">{errors.etage}</div>
              )}
            </div>

            {/* 🔤 Lettre */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-light">Lettre</label>
              <select
                className={`form-select ${errors.lettre ? "is-invalid" : ""}`}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56,189,248,0.2)",
                }}
                value={form.lettre}
                onChange={(e) => setForm({ ...form, lettre: e.target.value })}
              >
                <option value="">-- Choisir une lettre --</option>
                {lettres.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              {errors.lettre && (
                <div className="invalid-feedback">{errors.lettre}</div>
              )}
            </div>

            {/* 💡 Code aperçu */}
            {form.etage && form.lettre && (
              <div className="text-info fw-semibold mt-2">
                Code généré :{" "}
                <span className="text-warning">
                  {form.etage}
                  {form.lettre}
                </span>
              </div>
            )}
          </div>

          {/* ⚙️ Footer */}
          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn fw-semibold"
              style={{
                background: "linear-gradient(145deg, #38BDF8, #2563EB)",
                border: "none",
                borderRadius: "12px",
                color: "white",
              }}
              onClick={handleSave}
              disabled={loading}
            >
              {loading
                ? "⏳ Enregistrement..."
                : editingId
                ? "💾 Enregistrer"
                : "➕ Ajouter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SalleModal;
