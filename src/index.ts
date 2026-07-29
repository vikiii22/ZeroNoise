import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import eventRoutes from './routes/eventRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'ZeroNoise API funcionando' });
});

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err);
  });
