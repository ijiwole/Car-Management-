import { Document, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Role } from './auth';

export interface ICar extends Document {
  brand: string;
  carModel: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  status: 'available' | 'sold' | 'reserved';
  features: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  role: Role;
  firstName: string;
  lastName: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
} 