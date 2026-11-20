const Product = require("../models/product.model");
const RawMaterial = require("../models/rawMaterial.model");
const ProductionOrder = require("../models/productionOrder.model");
const StockMovement = require("../models/stockMovement.model");

async function getDashboard() {
  const totalProducts = await Product.countDocuments();
  const totalMaterials = await RawMaterial.countDocuments();
  const totalOrders = await ProductionOrder.countDocuments();

  // nombre d'ordres par statut
  const ordersByStatus = {
    PLANIFIE: 0,
    EN_COURS: 0,
    TERMINE: 0,
    ANNULE: 0
  };

  const groups = await ProductionOrder.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  groups.forEach((group) => {
    ordersByStatus[group._id] = group.count;
  });

  // matières sous leur seuil d'alerte
  const materials = await RawMaterial.find().lean();
  const lowStockMaterials = [];

  for (const material of materials) {
    const movements = await StockMovement.find({
      matiere: material._id
    }).lean();

    let stock = material.stockInitial || 0;

    for (const movement of movements) {
      if (movement.type === "ENTREE") {
        stock += movement.quantite;
      } else {
        stock -= movement.quantite;
      }
    }

    if (stock <= material.alertThreshold) {
      lowStockMaterials.push({
        _id: material._id,
        reference: material.reference,
        name: material.name,
        unit: material.unit,
        stock,
        alertThreshold: material.alertThreshold
      });
    }
  }

  return {
    totalProducts,
    totalMaterials,
    totalOrders,
    ordersByStatus,
    lowStockMaterials
  };
}

module.exports = { getDashboard };