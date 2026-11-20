import { useState } from "react";
import { UNITS, validateMaterial } from "../utils/validators";
import { getErrorMessage } from "../utils/getErrorMessage";

// initialValues = matière à modifier; absent = création
function MaterialForm({ initialValues, onSubmit, onCancel }) {
  const isCreate = !initialValues;

  const [form, setForm] = useState({
    reference: initialValues?.reference ?? "",
    name: initialValues?.name ?? "",
    unit: initialValues?.unit ?? UNITS[0],
    stockInitial: "0",
    alertThreshold: String(initialValues?.alertThreshold ?? 0)
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const validationErrors = validateMaterial(form, isCreate);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // normalisation des saisies
    const payload = {
      reference: form.reference.trim().toUpperCase(),
      name: form.name.trim(),
      unit: form.unit,
      alertThreshold: Number(form.alertThreshold)
    };

    if (isCreate) {
      payload.stockInitial = Number(form.stockInitial);
    }

    try {
      setLoading(true);
      await onSubmit(payload);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit} noValidate>
      <h2>{isCreate ? "Nouvelle matière première" : "Modifier la matière première"}</h2>

      {serverError && <p className="error" role="alert">{serverError}</p>}

      <div>
        <label htmlFor="reference">Référence</label>
        <input id="reference" name="reference" value={form.reference} onChange={handleChange} />
        {errors.reference && <span className="field-error">{errors.reference}</span>}
      </div>

      <div>
        <label htmlFor="name">Nom</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div>
        <label htmlFor="unit">Unité</label>
        <select id="unit" name="unit" value={form.unit} onChange={handleChange}>
          {UNITS.map((unit) => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
        {errors.unit && <span className="field-error">{errors.unit}</span>}
      </div>

      {isCreate && (
        <div>
          <label htmlFor="stockInitial">Stock initial</label>
          <input id="stockInitial" name="stockInitial" type="number" step="any" min="0" value={form.stockInitial} onChange={handleChange} />
          {errors.stockInitial && <span className="field-error">{errors.stockInitial}</span>}
        </div>
      )}

      <div>
        <label htmlFor="alertThreshold">Seuil d'alerte</label>
        <input id="alertThreshold" name="alertThreshold" type="number" step="any" min="0" value={form.alertThreshold} onChange={handleChange} />
        {errors.alertThreshold && <span className="field-error">{errors.alertThreshold}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default MaterialForm;