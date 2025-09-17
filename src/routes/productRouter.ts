import { Router } from "express";
import upload from "../middlewares/upload";
import {
  getProducts,
  findProduct,
  editProduct,
  deleteProduct,
  createProduct,
} from "../controllers/productController";

import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - reference
 *         - barcode
 *         - discountedPrice
 *         - cost
 *         - price
 *         - salePrice
 *         - tax
 *         - stock
 *         - categoryId
 *         - status
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *         reference:
 *           type: string
 *           description: Product reference
 *         barcode:
 *           type: string
 *           description: Barcode
 *         discountedPrice:
 *           type: number
 *           description: Discounted price
 *         cost:
 *           type: number
 *         price:
 *           type: number
 *         salePrice:
 *           type: number
 *         tax:
 *           type: number
 *         stock:
 *           type: integer
 *         categoryId:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         image:
 *           type: string
 *           format: binary
 *           description: Product image file
 *       example:
 *         name: "Laptop"
 *         reference: "LP123"
 *         barcode: "123456789"
 *         discountedPrice: 900
 *         cost: 800
 *         price: 1000
 *         salePrice: 950
 *         tax: 15
 *         stock: 50
 *         categoryId: 2
 *         status: "active"
 */

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", getProducts);

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post("/", requireAuth, upload.single("image"), createProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get("/:id", findProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.put("/:id", requireAuth, upload.single("image"), editProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.delete("/:id", requireAuth, deleteProduct);

export default router;
