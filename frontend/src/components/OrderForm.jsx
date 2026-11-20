import { useMemo, useState } from "react";
import OrderItemRow from "./OrderItemRow";
import { calculateRequirements } from "../utils/requirements";
import { getErrorMessage } from "../utils/getErrorMessage";
import { validateOrder } from "../utils/validators";

const EMPTY_ITEM = { product: "", quantity: "" };

// initialValues = { items: [{ product, quantity }], assignedTo } (modification)
function OrderForm({
  title,
  submitLabel,
  initialValues,
  products,
  operators,
  materials,
  onSubmit,
  onCancel
}) {
  // l'état des lignes est ici (parent); OrderItemRow ne fait que l'afficher
  const [items, setItems] = useState(
    initialValues?.items ?? [{ ...EMPTY_ITEM }]
  );
  const [assignedTo, setAssignedTo] = useState(initialValues?.assignedTo ?? "");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedIds = items.map((item) => item.product);

  // calcul dérivé: besoins totaux additionnés par matière
  const requirements = useMemo(() => {
    const lines = items
      .map((item) => ({
        quantity: Number(item.quantity),
        product: products.find((p) => p._id === item.product)
      }))
      .filter(
        (line) =>
          line.product && Number.isFinite(line.quantity) && line.quantity > 0
      )
      .map((line) => ({
        quantity: line.quantity,
        composition: line.product.composition
      }));

    return calculateRequirements(lines);
  }, [items, products]);

  const stockById = useMemo(
    () => new Map(materials.map((material) => [material.id, material.quantity])),
    [materials]
  );

  function updateItem(index, field, value) {
    setItems(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems([...items, { ...EMPTY_ITEM }]);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const validationErrors = validateOrder({ items, assignedTo });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = {
      items: items.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity)
      })),
      assignedTo
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

  const hasShortage = requirements.some((requirement) => {
    const available = stockById.get(requirement.id);
    return typeof available !== "number" || available < requirement.quantity;
  });

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h2>{title}</h2>

      {serverError && <p className="error" role="alert">{serverError}</p>}

      <div className="composition">
        <strong>Produits à fabriquer</strong>

        {items.map((item, index) => (
          <OrderItemRow
            key={index}
            index={index}
            item={item}
            products={products}
            selectedIds={selectedIds}
            canRemove={items.length > 1}
            onChange={updateItem}
            onRemove={removeItem}
          />
        ))}

        {errors.items && <span className="field-error">{errors.items}</span>}

        <div>
          <button type="button" className="btn-secondary" onClick={addItem}>
            + Ajouter un produit
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="assignedTo">Opérateur</label>
        <select
          id="assignedTo"
          value={assignedTo}
          onChange={(event) => setAssignedTo(event.target.value)}
        >
          <option value="">Choisir un opérateur</option>
          {operators.map((operator) => (
            <option key={operator._id} value={operator._id}>
              {operator.name} ({operator.email})
            </option>
          ))}
        </select>
        {errors.assignedTo && <span className="field-error">{errors.assignedTo}</span>}
      </div>

      {requirements.length > 0 && (
        <div>
          <strong>Besoins totaux en matières</strong>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Matière</th>
                  <th>Requis</th>
                  <th>Stock actuel</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((requirement) => {
                  const available = stockById.get(requirement.id);
                  const enough =
                    typeof available === "number" && available >= requirement.quantity;

                  return (
                    <tr key={requirement.id}>
                      <td>{requirement.name}</td>
                      <td>{requirement.quantity} {requirement.unit}</td>
                      <td>{available ?? "-"} {requirement.unit}</td>
                      <td>
                        {enough ? (
                          <span className="badge badge-ok">Suffisant</span>
                        ) : (
                          <span className="badge badge-danger">Insuffisant</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hasShortage && (
            <p className="error">
              Stock insuffisant : l'ordre peut être créé, mais l'opérateur ne pourra pas le démarrer.
            </p>
          )}
        </div>
      )}

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : submitLabel}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default OrderForm;