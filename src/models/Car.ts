import mongoose, { Document, Schema } from 'mongoose';
import { ICar } from '../types/models';

const carSchema = new Schema<ICar>({
  brand: {
     type: String, 
     required: true 
    },
  carModel: {
     type: String, 
     required: true 
    },
  year: { 
    type: Number, 
    required: true 
    },
  price: { 
    type: Number, 
    required: true 
    },
  mileage: { 
    type: Number, 
    required: true
     },
  color: { 
    type: String, 
    required: true 
    },
  fuelType: {
     type: String, 
     required: true
     },
  transmission: { 
    type: String, 
    required: true
     },
  status: { 
    type: String, 
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  features: [{
     type: String 
    }],
}, {
  timestamps: true
});

// Indexes for better query performance
carSchema.index({ brand: 1, carModel: 1 });
carSchema.index({ price: 1 });
carSchema.index({ status: 1 });

export default mongoose.model<ICar>('Car', carSchema); 