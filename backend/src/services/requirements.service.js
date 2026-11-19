function calculateRequirements(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("L'ordre doit contenir au moins un produit");
    error.statusCode = 400;
    throw error;
  }

  // totals = { idMatiere: quantitéTotale }
  const totals = {};

  for (const item of items) {
    if (!Array.isArray(item.composition) || item.quantity <= 0) {
      const error = new Error("Composition ou quantité invalide");
      error.statusCode = 400;
      throw error;
    }

    for (const line of item.composition) {
      const id = String(line.material);

      if (!totals[id]) {
        totals[id] = 0;
      }

      // quantité par unité x nombre d'unités, additionnée par matière
      totals[id] += line.quantity * item.quantity;
    }
  }

  return Object.keys(totals).map((id) => ({
    material: id,
    quantity: totals[id]
  }));
}

module.exports = { calculateRequirements };