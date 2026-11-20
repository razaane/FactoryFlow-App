function OrderItemRow({
  index,
  item,
  products,
  selectedIds,
  canRemove,
  onChange,
  onRemove
}) {
  return (
    <div className="composition-line">
      <select
        aria-label={`Produit ${index + 1}`}
        value={item.product}
        onChange={(event) => onChange(index, "product", event.target.value)}
      >
        <option value="">Choisir un produit</option>
        {products
          // un produit déjà choisi dans une autre ligne n'est plus proposé
          .filter((p) => p._id === item.product || !selectedIds.includes(p._id))
          .map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.reference})
            </option>
          ))}
      </select>

      <input
        type="number"
        step="any"
        min="0"
        aria-label={`Quantité ${index + 1}`}
        placeholder="Quantité"
        value={item.quantity}
        onChange={(event) => onChange(index, "quantity", event.target.value)}
      />

      <button
        type="button"
        className="btn-secondary"
        disabled={!canRemove}
        onClick={() => onRemove(index)}
      >
        Retirer
      </button>
    </div>
  );
}

export default OrderItemRow;