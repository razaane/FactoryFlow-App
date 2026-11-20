import { useState } from "react";
import { validateProduct } from "../utils/validators";
import { getErrorMessage } from "../utils/getErrorMessage";

const EMPTY_LINE = { material: "", quantity: "" };

// initialValues = produit à modifier; absent = création
// materials = liste des matières premières disponibles
function ProductForm({ initialValues, materials, onSubmit, onCancel }) {
  const isCreate = !initialValues;

  const [form, setForm] = useState({
    reference: initialValues?.reference ?? "",
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
    composition: initialValues
      ? initialValues.composition.map((line) => ({
          material: line.material?._id ?? line.material,
          quantity: String(line.quantity)
        }))
      : [{ ...EMPTY_LINE }]
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedIds = form.composition.map((line) => line.material);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function updateLine(index, field, value) {
    const composition = form.composition.map((line, i) =>
      i === index ? { ...line, [field]: value } : line
    );
    setForm({ ...form, composition });
  }

  function addLine() {
    setForm({ ...form, composition: [...form.composition, { ...EMPTY_LINE }] });
  }

  function removeLine(index) {
    setForm({
      ...form,
      composition: form.composition.filter((_, i) => i !== index)
    });
  }

  function unitOf(materialId) {
    return materials.find((m) => m.id === materialId)?.unit ?? "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const validationErrors = validateProduct(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // normalisation des saisies
    const payload = {
      reference: form.reference.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim(),
      composition: form.composition.map((line) => ({
        material: line.material,
        quantity: Number(line.quantity)
      }))
    };

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
      <h2>{isCreate ? "Nouveau produit" : "Modifier le produit"}</h2>

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

      <div className="full">
        <label htmlFor="description">Description</label>
        <input id="description" name="description" value={form.description} onChange={handleChange} />
      </div>

      <div className="full composition">
        <strong>Composition (par unité de produit)</strong>

        {form.composition.map((line, index) => (
          <div className="composition-line" key={index}>
            <select
              aria-label={`Matière ${index + 1}`}
              value={line.material}
              onChange={(event) => updateLine(index, "material", event.target.value)}
            >
              <option value="">Choisir une matière</option>
              {materials
                // une matière déjà choisie dans une autre ligne n'est plus proposée
                .filter((m) => m.id === line.material || !selectedIds.includes(m.id))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.reference})
                  </option>
                ))}
            </select>

            <input
              type="number"
              step="any"
              min="0"
              aria-label={`Quantité ${index + 1}`}
              placeholder={`Quantité ${unitOf(line.material)}`}
              value={line.quantity}
              onChange={(event) => updateLine(index, "quantity", event.target.value)}
            />

            <button
              type="button"
              className="btn-secondary"
              disabled={form.composition.length === 1}
              onClick={() => removeLine(index)}
            >
              Retirer
            </button>
          </div>
        ))}

        {errors.composition && <span className="field-error">{errors.composition}</span>}

        <div>
          <button type="button" className="btn-secondary" onClick={addLine}>
            + Ajouter une matière
          </button>
        </div>
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

export default ProductForm;