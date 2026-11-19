const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

function validateProductionOrderCreate(req, res, next) {
  const { items, assignedTo } = req.body;
  const errors = [];

  if (!Array.isArray(items) || items.length === 0) {
    errors.push("Un ordre doit contenir au moins un produit");
  } else {
    const seen = [];

    for (const item of items) {
      if (
        typeof item.product !== "string" ||
        !mongoose.isValidObjectId(item.product)
      ) {
        errors.push("Identifiant produit invalide");
      }

      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        errors.push("La quantité doit être strictement positive");
      }

      if (seen.includes(item.product)) {
        errors.push("Un produit ne peut apparaître qu'une seule fois");
      }

      seen.push(item.product);
    }
  }

  if (typeof assignedTo !== "string" || !mongoose.isValidObjectId(assignedTo)) {
    errors.push("Identifiant opérateur invalide");
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(", "), 400));
  }

  next();
}

module.exports = validateProductionOrderCreate;