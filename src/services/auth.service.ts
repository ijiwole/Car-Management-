import User from '../models/User';
import { RegisterPayload, LoginPayload } from '../types/auth';
import { generateToken, formatUserResponse } from '../utils/auth.utils';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

export class AuthService {
  async registerUser({ email, password, firstName, lastName, role }: RegisterPayload) {
    if (!email || !password || !firstName || !lastName) {
      throw new BadRequestError('Email, password, first name, and last name are required');
    }

    if (password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters long');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email already registered');
    }

    // Create user with role if provided, otherwise it will use the default 'sales' role
    const userData = { email, password, firstName, lastName, ...(role && { role }) };
    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id.toString());
    return formatUserResponse(user, token);
  }

  async loginUser({ email, password }: LoginPayload) {
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken(user._id.toString());
    return formatUserResponse(user, token);
  }
} 