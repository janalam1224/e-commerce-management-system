import { RequestHandler } from "express";
import { createOrderSchema, orderItemSchema } from "../schemas/schemas";
import prisma from "../../config/db.config";
import { Prisma } from "@prisma/client";
import { promises } from "dns";

export const fetchOrders: RequestHandler = async (req, res) => {
  const pageSize = parseInt(req.query.limit as string) || 5;
  const page = parseInt(req.query.page as string) || 1;
  const sortField = (req.query.sortField as string) || 'orderNumber';
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
  const searchQuery = (req.query.searchQuery as string)?.trim() || '';

  try {
    const orConditions: Prisma.OrderWhereInput[] = [];

    if (searchQuery) {
      orConditions.push({
        orderNumber: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      });

      orConditions.push({
        user: {
          firstName: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      });

      orConditions.push({
        user: {
          lastName: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      });

      orConditions.push({
        user: {
          email: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      });
    }

    const whereClause: Prisma.OrderWhereInput = orConditions.length > 0 ? { OR: orConditions } : {};

    const orders = await prisma.order.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortField]: sortOrder,
      },
      include: {
        user: true,
        items: true, 
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
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const createOrder: RequestHandler = async (req, res): Promise<any> => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation Failed" });
    }

    const { orderNumber, status, totalAmount, userId, items } = parsed.data;

    const existing = await prisma.order.findUnique({
      where: { orderNumber }
    });
    if (existing) {
      return res.status(422).json({ message: "Order already exists" });
    }
    
    const productIds = items.map( item => item.productId);
    const existingProducts = await prisma.product.findMany({
      where:{id:{ in:productIds}},
      select:{ id:true },
    });

    const existingIds = existingProducts.map(p => p.id);
    const missingIds = productIds.filter(id => !existingIds.includes(id));

     if (missingIds.length > 0) {
      return res.status(400).json({
        message: "Some product IDs do not exist",
        missingProductIds: missingIds,
      });
    }

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        status,
        totalAmount,
        user: {
          connect: { id: userId }
        },
        items: {
          create: items.map(item => ({
            quantity: item.quantity,
            price: item.price,
            product: {
              connect: { id: item.productId }
            }
          }))
        }
      },
      include: {
        items: true
      }
    });

    return res.status(201).json({ message: "Order created", data: newOrder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};


export const findOrder:RequestHandler = async(req, res):Promise<void> => {
const orderId = Number(req.params.id);
try {
  const order = await prisma.order.findUnique({
    where:{ id: orderId },
    include:{
      items:true,
    }
  });
  if(!order){
    res.status(404).json({ message:"Order not found" });
  }
   res.status(200).json({ order });
} catch (error) {
  console.log("Error find order", error);
  res.status(500).json({ message:"Internal Server Error" });
}
}

export const editOrder: RequestHandler = async (req, res) => {
  const orderId = Number(req.params.id);
  const { orderNumber, status, totalAmount, items } = req.body;

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
      status,
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

export const cancelOrder:RequestHandler = async(req, res):Promise<void> => {
 const orderId = Number(req.params.id);

   if (isNaN(orderId)) {
    res.status(400).json({ message: "Invalid order ID" });
  }

 try {
  const existingOrder = await prisma.order.findUnique({
    where:{ id: orderId }
  });
  if(!existingOrder){
    res.status(404).json({ message:"Order not found" });
  }
  const updateOrder = await prisma.order.update({
    where:{ id:orderId},
    data:{
      status:"cancel",
    }
  });

  res.status(200).json({ message:"order cancelled successfully", data:updateOrder });

 } catch (error) {
  console.log("Error cancelling order", error);
  res.status(500).json({ message:"Internal Server Error" });
 }
}

