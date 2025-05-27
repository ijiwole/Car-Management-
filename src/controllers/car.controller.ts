import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CarService } from '../services/car.service';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { CarFilters } from '../types/car';
import { PaginationOptions } from '../types/query';
import { IUser } from '../types/models';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const carService = new CarService();

export const createCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        status: StatusCodes.UNAUTHORIZED,
        error: 'Authentication required' 
      });
    }
    const car = await carService.createCar(req.body, req.user);
    res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      message: 'Car created successfully',
      data: car
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        status: StatusCodes.BAD_REQUEST,
        errors: error.message 
      });
    } else {
      next(error);
    }
  }
};

export const getCars = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        status: StatusCodes.UNAUTHORIZED,
        error: 'Authentication required' 
      });
    }

    const { brand, sort, page, limit, ...otherParams } = req.query;
    const filters: CarFilters = {};
    const pagination: PaginationOptions = {};
    
    if (brand) {
      filters.brand = brand as string;
    }


    if (page) {
      pagination.page = parseInt(page as string, 10);
    }
    if (limit) {
      pagination.limit = parseInt(limit as string, 10);
    }

    const allowedFilterFields = ['carModel', 'year', 'color', 'minPrice', 'maxPrice', 'status'];
    Object.entries(otherParams).forEach(([key, value]) => {
      if (allowedFilterFields.includes(key)) {
        filters[key as keyof CarFilters] = value as any;
      }
    });

    const result = await carService.getCars(filters, pagination);
    
    // Handle client-side sorting if requested
    let cars = result.data;
    if (sort === 'price') {
      cars = [...cars].sort((a, b) => a.price - b.price);
    }

    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Cars retrieved successfully',
      data: cars,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCarById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        status: StatusCodes.UNAUTHORIZED,
        error: 'Authentication required' 
      });
    }

    const car = await carService.getCarById(req.params.id);
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Car retrieved successfully',
      data: car
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({ 
        status: StatusCodes.NOT_FOUND,
        error: 'Car not found' 
      });
    } else {
      next(error);
    }
  }
};

export const updateCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        status: StatusCodes.UNAUTHORIZED,
        error: 'Authentication required' 
      });
    }
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) => value !== undefined && value !== null && value !== '')
    );

    // Check if there's any data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        error: 'No valid fields provided for update'
      });
    }

    const car = await carService.updateCar(req.params.id, updateData, req.user);
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Car updated successfully',
      data: car
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({ 
        status: StatusCodes.NOT_FOUND,
        error: 'Car not found' 
      });
    } else if (error instanceof BadRequestError) {
      // Convert validation errors to the expected format
      if (Array.isArray(error.message)) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
          status: StatusCodes.BAD_REQUEST,
          errors: error.message 
        });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({ 
          status: StatusCodes.BAD_REQUEST,
          error: error.message 
        });
      }
    } else {
      next(error);
    }
  }
};

export const deleteCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        status: StatusCodes.UNAUTHORIZED,
        error: 'Authentication required' 
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        status: StatusCodes.FORBIDDEN,
        error: 'Insufficient permissions' 
      });
    }

    await carService.deleteCar(req.params.id, req.user);
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({ 
        status: StatusCodes.NOT_FOUND,
        error: 'Car not found' 
      });
    } else if (error instanceof ForbiddenError) {
      res.status(StatusCodes.FORBIDDEN).json({ 
        status: StatusCodes.FORBIDDEN,
        error: 'Insufficient permissions' 
      });
    } else {
      next(error);
    }
  }
};