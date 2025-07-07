import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

import authRouter from './routes/authRouter';
import userRouter from './routes/userRouter';
import productRouter from './routes/productRouter';
import categoryRouter from './routes/categoryRouter';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
