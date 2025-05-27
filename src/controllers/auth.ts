import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/errors';

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  private handleError(error: unknown, res: Response) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
        status: error.statusCode
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      status: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.registerUser(req.body);
      res.status(StatusCodes.CREATED).json({
        message: 'User registered successfully',
        status: StatusCodes.CREATED,
        data: result
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.loginUser(req.body);
      res.status(StatusCodes.OK).json({
        message: 'Login successful',
        status: StatusCodes.OK,
        data: result
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };
}

export const authController = new AuthController(); 