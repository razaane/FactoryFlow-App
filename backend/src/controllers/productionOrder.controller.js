const productionOrderService =
  require("../services/productionOrder.service");

async function create(req, res, next) {
  try {
    const order = await productionOrderService.create({
      items: req.body.items,
      assignedTo: req.body.assignedTo,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Ordre de fabrication créé avec succès",
      data: order
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const order = await productionOrderService.update(
      req.params.id,
      {
        items: req.body.items,
        assignedTo: req.body.assignedTo
      }
    );

    return res.status(200).json({
      success: true,
      message: "Ordre modifié avec succès",
      data: order
    });
  } catch (error) {
    next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const order = await productionOrderService.cancel(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Ordre annulé avec succès",
      data: order
    });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
       const result = await productionOrderService.list({
      status: req.query.status,
      product: req.query.product,
      search: req.query.search,
      from: req.query.from,
      to: req.query.to,
      page: req.pagination.page,
      limit: req.pagination.limit
    });
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  update,
  cancel,
  list
};