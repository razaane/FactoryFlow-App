const dashboardService = require("../services/dashboard.service");

async function getDashboard(req, res, next) {
  try {
    const data = await dashboardService.getDashboard();

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard };