import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  icon: string;
  color: string;
  order: number;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  order: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);
