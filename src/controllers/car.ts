import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CarService } from '../services/car.service';
import { AppError, BadRequestError } from '../utils/errors';
import { CarFilters } from '../types/car';
import { PaginationOptions } from '../types/query';
import { IUser } from '../types/models';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

class CarController {
  private carService: CarService;

  constructor() {
    this.carService = new CarService();
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

  private parseQueryParams(req: Request) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      brand,
      carModel,
      year,
      minPrice,
      maxPrice,
      status,
      fuelType,
      transmission,
      color
    } = req.query;

    // Parse pagination params
    const pagination: PaginationOptions = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    // Validate pagination params
    if (pagination.page && pagination.page < 1) {
      throw new BadRequestError('Page number must be greater than 0');
    }
    if (pagination.limit && (pagination.limit < 1 || pagination.limit > 100)) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }
    if (pagination.sortOrder && !['asc', 'desc'].includes(pagination.sortOrder)) {
      throw new BadRequestError('Sort order must be either "asc" or "desc"');
    }

    // Parse filter params
    const filters: CarFilters = {
      brand: brand as string,
      carModel: carModel as string,
      year: year ? parseInt(year as string) : undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      status: status as 'available' | 'sold' | 'reserved',
      fuelType: fuelType as string,
      transmission: transmission as string,
      color: color as string
    };

    // Validate numeric filters
    if (filters.year && (filters.year < 1900 || filters.year > new Date().getFullYear())) {
      throw new BadRequestError('Invalid year');
    }
    if (filters.minPrice && filters.minPrice < 0) {
      throw new BadRequestError('Minimum price cannot be negative');
    }
    if (filters.maxPrice && filters.maxPrice < 0) {
      throw new BadRequestError('Maximum price cannot be negative');
    }
    if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
      throw new BadRequestError('Minimum price cannot be greater than maximum price');
    }

    return { pagination, filters };
  }

  createCar = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }
      const car = await this.carService.createCar(req.body, req.user);
      res.status(StatusCodes.CREATED).json({
        message: 'Car created successfully',
        status: StatusCodes.CREATED,
        data: car
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getCars = async (req: Request, res: Response) => {
    try {
      const { pagination, filters } = this.parseQueryParams(req);
      const result = await this.carService.getCars(filters, pagination);
      
      res.status(StatusCodes.OK).json({
        message: 'Cars retrieved successfully',
        status: StatusCodes.OK,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getCarById = async (req: Request, res: Response) => {
    try {
      const car = await this.carService.getCarById(req.params.id);
      res.status(StatusCodes.OK).json({
        message: 'Car retrieved successfully',
        status: StatusCodes.OK,
        data: car
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  updateCar = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }
      const car = await this.carService.updateCar(req.params.id, req.body, req.user);
      res.status(StatusCodes.OK).json({
        message: 'Car updated successfully',
        status: StatusCodes.OK,
        data: car
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  deleteCar = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }
      await this.carService.deleteCar(req.params.id, req.user);
      res.status(StatusCodes.OK).json({
        message: 'Car deleted successfully',
        status: StatusCodes.OK
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

}

export const carController = new CarController(); 