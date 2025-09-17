import { Router } from "express";
import {
  getTransactions,
  createTransaction,
  findTransaction,
  editTransaction,
  deleteTransaction,
} from "../controllers/transactionController";

const router = Router();

router.get("/", getTransactions);

router.post("/", createTransaction);

router.get("/:id", findTransaction);

router.put("/:id", editTransaction);

router.delete("/:id", deleteTransaction);
