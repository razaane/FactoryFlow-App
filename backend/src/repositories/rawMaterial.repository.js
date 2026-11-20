
const RawMaterial = require("../models/rawMaterial.model");

async function create(data) {
  return RawMaterial.create(data);
}

async function findByReference(reference) {
  return RawMaterial.findOne({ reference });
}

async function findById(id) {
  return RawMaterial.findById(id);
}

function buildFilter(search) {
  if (!search) {
    return {};
  }

  const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return {
    $or: [
      { name: { $regex: safe, $options: "i" } },
      { reference: { $regex: safe, $options: "i" } }
    ]
  };
}

async function findAll(skip, limit, search) {
  return RawMaterial.find(buildFilter(search))
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function count(search) {
  return RawMaterial.countDocuments(buildFilter(search));
}

async function updateById(id, data) {
  return RawMaterial.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}


async function findBelowThreshold() {
  return RawMaterial.find({
    $expr: {
      $lte: ["$quantity", "$alertThreshold"]
    }
  })
    .select("reference name quantity alertThreshold unit")
    .sort({ quantity: 1 })
    .lean();
}
module.exports = {
  create,
  findByReference,
  findById,
  buildFilter,
  findAll,
  count,
  updateById,
  findBelowThreshold
};