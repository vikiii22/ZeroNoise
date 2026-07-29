import { Request, Response } from 'express';
import Category from '../models/Category';

export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};
