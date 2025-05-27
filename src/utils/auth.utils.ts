import jwt from 'jsonwebtoken';
import { IUser } from '../types/models';
import { AuthResponse } from '../types/auth';
import { AppError } from './errors';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('JWT_SECRET is not defined');
  }
  return jwt.sign({ _id: userId }, secret, {
    expiresIn: '7d'
  });
};

export const formatUserResponse = (user: IUser, token: string): AuthResponse => {
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  };
}; 