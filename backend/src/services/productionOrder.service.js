const mongoose = require("mongoose");

const AppError = require("../utils/AppError");

const Product = require("../models/product.model");
const User = require("../models/user.model");

const productionOrderRepository =
  require("../repositories/productionOrder.repository");

// Vérifie que l'utilisateur existe et qu'il est opérateur
async function checkOperator(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Identifiant opérateur invalide", 400);
  }

  const operator = await User.findById(userId).lean();

  if (!operator) {
    throw new AppError("Utilisateur introuvable", 404);
  }

  if (operator.role !== "Operateur") {
    throw new AppError(
      "L'utilisateur affecté doit être un opérateur",
      400
    );
  }

  return operator;
}

// [{ product, quantity }]  ->  items avec une COPIE de la composition de chaque produit
async function buildItems(items) {
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product).lean();

    if (!product) {
      throw new AppError("Produit introuvable", 404);
    }

    const composition = product.composition.map((line) => ({
      material: line.material,
      quantity: line.quantity
    }));

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      composition
    });
  }

  return orderItems;
}

async function create({ items, assignedTo, createdBy }) {
  const operator = await checkOperator(assignedTo);
  const orderItems = await buildItems(items);

  const reference = `OF-${Date.now()}`;

  try {
    return await productionOrderRepository.create({
      reference,
      items: orderItems,
      status: "PLANIFIE",
      assignedTo: operator._id,
      createdBy
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(
        "La référence de l'ordre existe déjà",
        409
      );
    }

    throw error;
  }
}

async function update(id, { items, assignedTo }) {
  const order = await productionOrderRepository.findById(id);

  if (!order) {
    throw new AppError("Ordre introuvable", 404);
  }

  if (order.status !== "PLANIFIE") {
    throw new AppError(
      "Seul un ordre planifié peut être modifié",
      409
    );
  }

  const data = {};

  if (items !== undefined) {
    data.items = await buildItems(items);
  }

  if (assignedTo !== undefined) {
    const operator = await checkOperator(assignedTo);
    data.assignedTo = operator._id;
  }

  return productionOrderRepository.updateById(id, data);
}

async function cancel(id) {
  const order = await productionOrderRepository.findById(id);

  if (!order) {
    throw new AppError("Ordre introuvable", 404);
  }

  if (order.status !== "PLANIFIE") {
    throw new AppError(
      "Seul un ordre planifié peut être annulé",
      409
    );
  }

  return productionOrderRepository.cancelById(id, {
    status: "ANNULE",
    cancelledAt: new Date()
  });
}

async function list({ status, product, search, from, to, page, limit }) {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (product) {
    filter["items.product"] = product;
  }

  // recherche par référence (ex: OF-17...)
  if (search) {
    const safeSearch = String(search)
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.reference = { $regex: safeSearch, $options: "i" };
  }

  if (from || to) {
    filter.createdAt = {};

    if (from) {
      filter.createdAt.$gte = new Date(from);
    }

    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endDate;
    }
  }

  return productionOrderRepository.findFiltered({
    filter,
    page,
    limit
  });
}

async function getById(req, res, next) {
  try {
    const order = await productionOrderService.getById(req.params.id);

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  create,
  update,
  cancel,
  list,
  getById
};