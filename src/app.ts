import express from "express";
import setupSwagger from "../config/swagger";

import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";
import productRouter from "./routes/productRouter";
import categoryRouter from "./routes/categoryRouter";
import orderRouter from "./routes/orderRouter";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

app.use("/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
