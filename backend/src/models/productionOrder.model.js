const mongoose = require("mongoose");

const compositionSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

// une ligne de l'ordre = un produit + sa quantité + une copie de sa composition
const itemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => value > 0,
        message: "La quantité doit être strictement positive"
      }
    },
    composition: [compositionSchema]
  },
  { _id: false }
);

const productionOrderSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    items: {
      type: [itemSchema],
      required: true,
      validate: {
        validator: (items) => items.length >= 1,
        message: "Un ordre doit contenir au moins un produit"
      }
    },

    status: {
      type: String,
      enum: ["PLANIFIE", "EN_COURS", "TERMINE", "ANNULE"],
      default: "PLANIFIE",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    startedAt: { type: Date, default: null },
    startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    finishedAt: { type: Date, default: null },
    finishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    cancelledAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductionOrder", productionOrderSchema);