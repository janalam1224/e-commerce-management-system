import { Router } from "express";
import {
  fetchOrders,
  createOrder,
  findOrder,
  editOrder,
  deleteOrder,
} from "../controllers/orderController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique ID of the order item
 *         productId:
 *           type: integer
 *           description: ID of the product
 *         quantity:
 *           type: integer
 *           description: Quantity of the product in the order
 *         price:
 *           type: number
 *           format: float
 *           description: Price per product
 *       example:
 *         id: 10
 *         productId: 5
 *         quantity: 2
 *         price: 150.50
 *
 *     Order:
 *       type: object
 *       required:
 *         - orderNumber
 *         - totalAmount
 *         - userId
 *         - items
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique ID of the order
 *         orderNumber:
 *           type: string
 *           description: Unique order number
 *         totalAmount:
 *           type: number
 *           format: float
 *           description: Total amount of the order
 *         userId:
 *           type: integer
 *           description: ID of the user who placed the order
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         user:
 *           type: object
 *           description: User details who placed the order
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *       example:
 *         id: 100
 *         orderNumber: "ORD-2025001"
 *         totalAmount: 450.75
 *         userId: 1
 *         items:
 *           - productId: 5
 *             quantity: 2
 *             price: 150.50
 *           - productId: 7
 *             quantity: 1
 *             price: 149.75
 *         user:
 *           id: 1
 *           name: "John Doe"
 *           email: "john@example.com"
 */

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Fetch all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get("/", fetchOrders);

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.post("/", createOrder);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *
 *   put:
 *     summary: Update an existing order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *   delete:
 *     summary: Delete an order
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Order deleted successfully
 */
router.get("/:id", findOrder);
router.put("/:id", editOrder);
router.delete("/:id", requireAuth, deleteOrder);

export default router;
