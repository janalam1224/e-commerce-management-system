import { Router } from "express";
import { logIn, signUp } from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", logIn);

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               telephone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             oneOf:
 *               - required: [telephone]
 *               - required: [gender]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       422:
 *         description: User already exists
 */
router.post("/signup", signUp);

export default router;
