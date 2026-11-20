import { useState } from "react";
import { validateStockEntry } from "../utils/validators";
import { getErrorMessage } from "../utils/getErrorMessage";

function StockEntryForm({ unit, onSubmit }) {
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationError = validateStockEntry(quantity);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      await onSubmit(Number(quantity));
      setQuantity("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h2>Entrée de stock</h2>

      {error && <p className="error" role="alert">{error}</p>}

      <label htmlFor="quantity">Quantité reçue ({unit})</label>
      <input
        id="quantity"
        type="number"
        step="any"
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
      />

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer l'entrée"}
        </button>
      </div>
    </form>
  );
}

export default StockEntryForm;