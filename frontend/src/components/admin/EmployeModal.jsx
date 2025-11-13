import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

const EmployeModal = forwardRef(({ onSave }, ref) => {
  const modalRef = useRef(null);
  const bsModal = useRef(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    departement: "",
    username: "",
    password: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🎯 Expose open() to parent
  useImperativeHandle(ref, () => ({
    open: (data = null) => {
      if (data) {
        setForm({
          nom: data.nom || "",
          prenom: data.prenom || "",
          departement: data.departement || "",
          username: data.username || "",
          password: "",
          email: data.email || "",
        });
        setEditingId(data.id || null);
      } else {
        setForm({
          nom: "",
          prenom: "",
          departement: "",
          username: "",
          password: "",
          email: "",
        });
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
      } catch (e) {
        console.warn('Error disposing modal:', e);
      }
    };
  }, []);

  // ✅ Validation
  const validate = () => {
    const errs = {};
    if (!form.nom.trim()) errs.nom = "Le nom est obligatoire.";
    if (!form.prenom.trim()) errs.prenom = "Le prénom est obligatoire.";
    if (!form.departement.trim()) errs.departement = "Département requis.";
    if (!form.username.trim()) errs.username = "Nom d’utilisateur requis.";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errs.email = "Adresse e-mail invalide.";

    // Password rules
    if (!editingId && !form.password.trim()) {
      errs.password = "Mot de passe requis.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ✅ Handle Save
  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);

    // Only include password if entered
    const payload = { ...form };
    if (editingId && !form.password.trim()) delete payload.password;

    await onSave(payload, editingId);
    setLoading(false);
    bsModal.current.hide();
  };
  const sanitizeText = (value) => {
    return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s-]/g, "");
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
            backdropFilter: "blur(10px)",
            borderRadius: "18px",
            border: "1px solid rgba(56,189,248,0.2)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div
            className="modal-header border-0"
            style={{
              borderBottom: "1px solid rgba(56,189,248,0.15)",
            }}
          >
            <h5
              className="modal-title fw-bold"
              style={{ color: "#38BDF8", letterSpacing: "0.5px" }}
            >
              {editingId ? "Modifier l'employé" : "Ajouter un employé"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body pb-2">
            {["nom", "prenom", "departement", "username", "email"].map(
              (field) => (
                <div className="mb-3" key={field}>
                  <label className="form-label fw-semibold text-light">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    className={`form-control ${errors[field] ? "is-invalid" : ""
                      }`}
                    style={{
                      background: "rgba(15,23,42,0.8)",
                      color: "#E2E8F0",
                      border: "1px solid rgba(56,189,248,0.2)",
                      borderRadius: "10px",
                    }}
                    value={form[field]}
                    onChange={(e) => {
                      const value = e.target.value;

                      // If it's one of the restricted fields → sanitize
                      const updatedValue = ["nom", "prenom", "departement"].includes(field)
                        ? sanitizeText(value)
                        : value;

                      setForm({ ...form, [field]: updatedValue });
                    }}

                  />
                  {errors[field] && (
                    <div className="invalid-feedback">{errors[field]}</div>
                  )}
                </div>
              )
            )}

            {/* 🧩 Password field always visible */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-light">
                Mot de passe{" "}
                {editingId && (
                  <small className="text-muted">
                    (laisser vide pour ne pas changer)
                  </small>
                )}
              </label>
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""
                  }`}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: "10px",
                }}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="modal-footer border-0 pt-0"
            style={{
              borderTop: "1px solid rgba(56,189,248,0.15)",
            }}
          >
            <button
              type="button"
              className="btn"
              data-bs-dismiss="modal"
              style={{
                background: "rgba(51,65,85,0.8)",
                border: "none",
                borderRadius: "12px",
                color: "#CBD5E1",
                padding: "0.4rem 1rem",
              }}
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
                padding: "0.45rem 1.2rem",
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

export default EmployeModal;
