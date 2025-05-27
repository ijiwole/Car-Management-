import Car from '../models/Car';
import { ICar, IUser } from '../types/models';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/errors';
import { CarFilters, CarQueryResult, CreateCarPayload } from '../types/car';
import { PaginationOptions } from '../types/query';

export class CarService {
  private validateUserRole(user: IUser, allowedRoles: string[], action: string) {
    if (!allowedRoles.includes(user.role)) {
      throw new UnauthorizedError(`Only ${allowedRoles.join(' or ')} can ${action}`);
    }
  }

  private validateCreateCarPayload(data: Partial<CreateCarPayload>): asserts data is CreateCarPayload {
    const requiredFields: (keyof CreateCarPayload)[] = [
      'brand',
      'carModel',
      'year',
      'price',
      'mileage',
      'color',
      'fuelType',
      'transmission',
      'status'
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new BadRequestError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate numeric fields
    if (data.year && (data.year < 1900 || data.year > new Date().getFullYear())) {
      throw new BadRequestError('Invalid year');
    }
    if (data.price && data.price < 0) {
      throw new BadRequestError('Price cannot be negative');
    }
    if (data.mileage && data.mileage < 0) {
      throw new BadRequestError('Mileage cannot be negative');
    }

    // Validate status
    if (data.status && !['available', 'sold', 'reserved'].includes(data.status)) {
      throw new BadRequestError('Invalid status value');
    }
  }

  async createCar(carData: Partial<CreateCarPayload>, user: IUser): Promise<ICar> {
    this.validateUserRole(user, ['admin', 'manager'], 'create cars');

    this.validateCreateCarPayload(carData);

    const car = new Car(carData);
    await car.save();
    return car;
  }

  async getCars(filters: CarFilters = {}, pagination: PaginationOptions = {}): Promise<CarQueryResult> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = pagination;

    // Build filter query
    const query: any = {};
    
    if (filters.brand) {
      query.brand = { $regex: filters.brand, $options: 'i' };
    }
    if (filters.carModel) {
      query.carModel = { $regex: filters.carModel, $options: 'i' };
    }
    if (filters.year) {
      query.year = filters.year;
    }
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.fuelType) {
      query.fuelType = { $regex: filters.fuelType, $options: 'i' };
    }
    if (filters.transmission) {
      query.transmission = { $regex: filters.transmission, $options: 'i' };
    }
    if (filters.color) {
      query.color = { $regex: filters.color, $options: 'i' };
    }

  
    const skip = (page - 1) * limit;

  
    const total = await Car.countDocuments(query);


    const cars = await Car.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);


    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: cars,
      total,
      page,
      totalPages,
      hasNext,
      hasPrev
    };
  }

  async getCarById(id: string): Promise<ICar> {
    const car = await Car.findById(id);
    if (!car) {
      throw new NotFoundError('Car not found');
    }
    return car;
  }

  async updateCar(id: string, updates: Partial<ICar>, user: IUser): Promise<ICar> {
    this.validateUserRole(user, ['admin', 'manager'], 'update cars');

    const car = await Car.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!car) {
      throw new NotFoundError('Car not found');
    }
    return car;
  }

  async deleteCar(id: string, user: IUser): Promise<void> {
    // Check if user has permission to delete cars
    this.validateUserRole(user, ['admin'], 'delete cars');

    const car = await Car.findByIdAndDelete(id);
    if (!car) {
      throw new NotFoundError('Car not found');
    }
  }
} 