const express = require("express");
const router = express.Router();

const controller = require("../controllers/dashboard.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Tableau de bord administrateur
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Totaux, ordres par statut et matières sous le seuil
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès réservé à l'administrateur
 */
router.use(authenticate, authorize("Admin"));

router.get("/", controller.getDashboard);

module.exports = router;