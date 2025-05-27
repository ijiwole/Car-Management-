import { Response } from 'supertest';
import jwt from 'jsonwebtoken';
import { Role } from '../types/auth';
import { Types } from 'mongoose';

export const TEST_USER_ID = new Types.ObjectId().toHexString();

export const generateToken = (userId: string = TEST_USER_ID, role: Role = 'admin'): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required for tests');
  }
  return jwt.sign({ _id: userId, role }, secret, { expiresIn: '1h' });
};

export const createAuthHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export const expectError = (response: Response, status: number, message: string) => {
  expect(response.status).toBe(status);
  expect(response.body).toHaveProperty('error');
  expect(response.body.error).toBe(message);
};

export const testCar = {
  brand: 'Toyota',
  carModel: 'Camry',
  year: 2021,
  price: 15000,
  mileage: 30000,
  color: 'Red',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  features: ['Air Conditioning', 'Navigation'],
  isAvailable: true,
  status: 'available' as const
};

export const testUser = {
  _id: TEST_USER_ID,
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin' as Role,
  isActive: true
}; 