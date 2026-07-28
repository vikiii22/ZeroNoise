import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  category: 'Games' | 'Creativity' | 'DIY' | 'Movement';
  physicalReference: string;
  mapUrl?: string;
  startTime: Date;
  creatorId: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  location: {
    type: string;
    coordinates: number[];
  };
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Games', 'Creativity', 'DIY', 'Movement'], required: true },
  physicalReference: { type: String, required: true },
  mapUrl: { type: String },
  startTime: { type: Date, required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  }
}, { timestamps: true });

EventSchema.index({ location: '2dsphere' });

export default mongoose.model<IEvent>('Event', EventSchema);
