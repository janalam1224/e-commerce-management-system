import { RequestHandler } from "express";
import { createOrderSchema, orderItemSchema } from "../schemas/schemas";
import prisma from "../../config/db.config";
import { Prisma } from "@prisma/client";

export const fetchOrders: RequestHandler = async (req, res) => {
  const pageSize = parseInt(req.query.limit as string) || 5;
  const page = parseInt(req.query.page as string) || 1;
  const sortField = (req.query.sortField as string) || "orderNumber";
  const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";
  const searchQuery = (req.query.searchQuery as string)?.trim() || "";

  try {
    const orConditions: Prisma.OrderWhereInput[] = [];

    if (searchQuery) {
      orConditions.push({
        orderNumber: {
          contains: searchQuery,
          mode: "insensitive",
        },
      });

      const whereClause: Prisma.OrderWhereInput =
        orConditions.length > 0 ? { OR: orConditions } : {};

      const orders = await prisma.order.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          [sortField]: sortOrder,
        },
        include: {
          items: true,
          user: true,
        },
      });

      const totalOrders = await prisma.order.count({ where: whereClause });

      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          total: totalOrders,
          page,
          pageSize,
          totalPages: Math.ceil(totalOrders / pageSize),
        },
      });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Create New Order
export const createOrder: RequestHandler = async (req, res): Promise<any> => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation Failed" });
    }

    const { orderNumber, totalAmount, userId, items } = parsed.data;

    // Check if order already exists
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (existing)
      return res.status(422).json({ message: "Order already exists" });

    const productIds = items.map((item) => item.productId);

    // Fetch products with stock info
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true },
    });

    // Check for missing products
    const existingIds = products.map((p) => p.id);
    const missingIds = productIds.filter((id) => !existingIds.includes(id));
    if (missingIds.length > 0) {
      return res.status(400).json({
        message: "Some product IDs do not exist",
        missingProductIds: missingIds,
      });
    }

    // Check stock availability
    const outOfStockItems = items.filter((item) => {
      const product = products.find((p) => p.id === item.productId);
      return (
        !product || (product.stock ?? 0) <= 0 || item.quantity > product.stock
      );
    });

    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        message: "Some items are out of stock or exceed available quantity",
        items: outOfStockItems,
      });
    }

    // Create order if all checks pass
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        user: { connect: { id: userId } },
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            product: { connect: { id: item.productId } },
          })),
        },
      },
      include: { items: true, user: true },
    });

    // Decrement stock
    await Promise.all(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    return res.status(201).json({ message: "Order created", data: newOrder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

// Find Order
export const findOrder: RequestHandler = async (req, res): Promise<void> => {
  const orderId = Number(req.params.id);
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
      },
    });
    if (!order) {
      res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order });
  } catch (error) {
    console.log("Error find order", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editOrder: RequestHandler = async (req, res) => {
  const orderId = Number(req.params.id);
  const { orderNumber, totalAmount, items } = req.body;

  if (isNaN(orderId)) {
    res.status(400).json({ message: "Invalid order ID" });
    return;
  }

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const updateData: any = {
      orderNumber,
      totalAmount,
    };

    // Conditionally add item updates if valid
    if (items && Array.isArray(items)) {
      const itemsToUpdate = items.filter((item: any) => item.id !== undefined);

      if (itemsToUpdate.length > 0) {
        updateData.items = {
          update: itemsToUpdate.map((item: any) => ({
            where: { id: item.id },
            data: {
              quantity: item.quantity,
              price: item.price,
            },
          })),
        };
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true },
    });

    res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Order
export const deleteOrder: RequestHandler = async (req, res): Promise<void> => {
  const orderId = Number(req.params.id);

  if (isNaN(orderId)) {
    res.status(400).json({ message: "Invalid order ID" });
    return;
  }

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Restore stock before deleting order
    await Promise.all(
      existingOrder.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      )
    );

    await prisma.order.delete({
      where: { id: orderId },
    });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
