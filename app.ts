import dotenv from 'dotenv';

import express, { Application } from 'express';
import authRouter from './routes/authRouter';
import userRouter from './routes/userRouter';
import productRouter from './routes/productRouter';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
