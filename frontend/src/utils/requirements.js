// lines = [{ quantity, composition: [{ material: { _id, name, unit }, quantity }] }]
// retourne les besoins additionnés par matière: [{ id, name, unit, quantity }]
export function calculateRequirements(lines) {
  const totals = new Map();

  for (const line of lines) {
    for (const part of line.composition) {
      const id = part.material._id ?? part.material;

      const current = totals.get(id) ?? {
        id,
        name: part.material.name ?? "",
        unit: part.material.unit ?? "",
        quantity: 0
      };

      // quantité par unité x nombre d'unités
      current.quantity += part.quantity * line.quantity;
      totals.set(id, current);
    }
  }

  // arrondi pour éviter 0.1 x 3 = 0.30000000000000004
  return [...totals.values()].map((requirement) => ({
    ...requirement,
    quantity: Math.round(requirement.quantity * 1e6) / 1e6
  }));
}