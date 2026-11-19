const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/authenticate");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification (connexion et profil)
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter (Admin ou Opérateur)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@factoryflow.com"
 *               password:
 *                 type: string
 *                 example: "Admin1234"
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le token JWT
 *       400:
 *         description: Champs manquants ou invalides
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Consulter le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur connecté
 *       401:
 *         description: Authentification requise
 */
router.get("/me", authenticate, authController.getProfile);

module.exports = router;