import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

import authRouter from './routes/authRouter';
import userRouter from './routes/userRouter';
import productRouter from './routes/productRouter';
import catRouter from './routes/catRouter';
import addressRouter from './routes/addressRouter';
import orderRouter from './routes/orderRouter';
import transactionRouter from './routes/transactionRouter';
import cartRouter from './routes/cartRouter';
import reviewRouter from './routes/reviewRouter';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', catRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/orders', orderRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/cartItems', cartRouter);
app.use('/api/reviews', reviewRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
