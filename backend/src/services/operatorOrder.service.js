const mongoose = require("mongoose");
const ProductionOrder = require("../models/productionOrder.model");
const StockMovement = require("../models/stockMovement.model");
const RawMaterial = require("../models/rawMaterial.model");
const productionOrderRepository =
  require("../repositories/productionOrder.repository");
const calculateRequirements =
  require("./requirements.service").calculateRequirements;

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function checkId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Identifiant invalide", 400);
  }
}

// mes ordres (filtre optionnel par statut), paginés: { data, meta }
async function listMyOrders({ userId, status, page, limit }) {
  return productionOrderRepository.findByAssignedTo({
    assignedTo: userId,
    status,
    page,
    limit
  });
}

// détail d'un ordre, uniquement s'il m'est affecté
async function getMyOrder({ userId, orderId }) {
  checkId(orderId);

  const order = await productionOrderRepository.findByIdAndAssignedTo(
    orderId,
    userId
  );

  if (!order) {
    throw createError("Ordre introuvable ou non affecté", 404);
  }

  return order;
}

async function start(orderId, operatorId) {
  checkId(orderId);

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const order = await ProductionOrder.findOne({
        _id: orderId,
        assignedTo: operatorId
      }).session(session);

      if (!order) {
        throw createError("Ordre introuvable ou non affecté", 404);
      }

      if (order.status !== "PLANIFIE") {
        throw createError("Seul un ordre planifié peut démarrer", 400);
      }

      // Besoins totaux de TOUS les produits, additionnés par matière
      const requirements = calculateRequirements(order.items);

      // Vérifier TOUTES les matières avant de créer des sorties.
      for (const requirement of requirements) {
        const material = await RawMaterial.findById(requirement.material)
          .session(session);

        if (!material) {
          throw createError("Matière première introuvable", 404);
        }

        const movements = await StockMovement.find({
          matiere: requirement.material
        }).session(session);

        let stock = material.stockInitial || 0;

        for (const movement of movements) {
          stock += movement.type === "ENTREE"
            ? movement.quantite
            : -movement.quantite;
        }

        if (stock < requirement.quantity) {
          throw createError(
            `Stock insuffisant pour ${material.name} (requis ${requirement.quantity} ${material.unit}, disponible ${stock})`,
            400
          );
        }
      }

      // Aucune déduction n'est faite avant la fin des vérifications.
      for (const requirement of requirements) {
        await StockMovement.create(
          [{
            matiere: requirement.material,
            type: "SORTIE",
            quantite: requirement.quantity
          }],
          { session }
        );
      }

      order.status = "EN_COURS";
      order.startedAt = new Date();
      order.startedBy = operatorId;
      await order.save({ session });

      result = order;
    });

    return result;
  } finally {
    await session.endSession();
  }
}

async function finish(orderId, operatorId) {
  checkId(orderId);

  const order = await ProductionOrder.findOne({
    _id: orderId,
    assignedTo: operatorId
  });

  if (!order) {
    throw createError("Ordre introuvable ou non affecté", 404);
  }

  if (order.status !== "EN_COURS") {
    throw createError("Seul un ordre en cours peut être terminé", 400);
  }

  order.status = "TERMINE";
  order.finishedAt = new Date();
  order.finishedBy = operatorId;
  await order.save();

  return order;
}

// historique: mes ordres terminés, paginés: { data, meta }
async function history(operatorId, query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

  return productionOrderRepository.findByAssignedTo({
    assignedTo: operatorId,
    status: "TERMINE",
    page,
    limit
  });
}

module.exports = { listMyOrders, getMyOrder, start, finish, history };