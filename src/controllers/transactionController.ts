import { RequestHandler } from "express";
import prisma from "../../config/db.config";
import { createTransactionSchema } from "../schemas/schemas";

export const getTransactions: RequestHandler = async (
  req,
  res
): Promise<any> => {
  try {
    const transactions = await prisma.transaction.findMany();

    return res.status(200).json({ transactions });
  } catch (error) {
    console.log("Error while fetching transactions", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTransaction: RequestHandler = async (
  req,
  res
): Promise<any> => {
  try {
    const parsed = createTransactionSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", error: parsed.error.format() });
    }

    const { transactionId, paymentMethod, amount, discount, userId, orderId } =
      parsed.data;

    const transaction = await prisma.transaction.findUnique({
      where: { transactionId },
    });
    if (transaction) {
      return res.status(409).json({ message: "Transaction already exists" });
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        transactionId,
        paymentMethod,
        amount,
        discount,
        userId,
        orderId,
      },
    });

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    console.log("Error while creating new transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const findTransaction: RequestHandler = async (
  req,
  res
): Promise<any> => {
  const id = Number(req.params.id);
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({ transaction });
  } catch (error) {
    console.log("Error while finding transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editTransaction: RequestHandler = async (
  req,
  res
): Promise<any> => {
  const id = Number(req.params.id);
  try {
    const parsed = createTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", error: parsed.error.format() });
    }
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const { transactionId, paymentMethod, amount, discount, userId, orderId } =
      parsed.data;

    const updateTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        transactionId,
        paymentMethod,
        amount,
        discount,
        userId,
        orderId,
      },
    });

    return res
      .status(200)
      .json({ message: "Transaction updated successfully", updateTransaction });
  } catch (error) {
    console.log("Error while updating transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTransaction: RequestHandler = async (
  req,
  res
): Promise<any> => {
  const transId = Number(req.params.id);
  try {
    const existing = await prisma.transaction.findUnique({
      where: { id: transId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const deleteTransaction = await prisma.transaction.delete({
      where: { id: transId },
    });

    return res.status(204).send();
  } catch (error) {
    console.log("Error while deleting transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
