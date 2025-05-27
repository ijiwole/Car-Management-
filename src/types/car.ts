import { ICar } from './models';
import { QueryResult } from './query';

export interface CreateCarPayload {
  brand: string;
  carModel: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  status: 'available' | 'sold' | 'reserved';
  description?: string;
  features?: string[];
  images?: string[];
}

export interface CarFilters {
  brand?: string;
  carModel?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: 'available' | 'sold' | 'reserved';
  fuelType?: string;
  transmission?: string;
  color?: string;
}

export type CarQueryResult = QueryResult<ICar>; 