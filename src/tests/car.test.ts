import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../app';
import Car from '../models/Car';
import User from '../models/User';
import { testCar, generateToken, createAuthHeader, expectError, testUser, TEST_USER_ID } from './helpers';


describe('Car Endpoints', () => {
  let authToken: string;
  let createdCarId: string;

  beforeAll(async () => {
    // Create a test user in the DB
    await User.deleteMany({});
    await new User(testUser).save();
    // Create a test user token
    authToken = generateToken(TEST_USER_ID, 'admin');
  });

  beforeEach(async () => {
    // Clear cars collection
    await Car.deleteMany({});
    createdCarId = '';
  });

  describe('POST /api/cars', () => {
    it('should create a new car', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set(createAuthHeader(authToken))
        .send(testCar);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('status', StatusCodes.CREATED);
      expect(response.body).toHaveProperty('message', 'Car created successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.brand).toBe(testCar.brand);
      expect(response.body.data.carModel).toBe(testCar.carModel);
      createdCarId = response.body.data._id;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/cars')
        .send(testCar);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body).toHaveProperty('status', StatusCodes.UNAUTHORIZED);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set(createAuthHeader(authToken))
        .send({ brand: 'Toyota' }); // Missing required fields

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('status', StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/cars', () => {
    beforeEach(async () => {
      await Car.deleteMany({});
      await Car.create([
        testCar,
        { ...testCar, brand: 'Honda', carModel: 'Civic' },
        { ...testCar, brand: 'Ford', carModel: 'Mustang' }
      ]);
    });    

    it('should get all cars', async () => {
      const response = await request(app)
        .get('/api/cars')
        .set(createAuthHeader(authToken));

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('status', StatusCodes.OK);
      expect(response.body).toHaveProperty('message', 'Cars retrieved successfully');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter cars by brand', async () => {
      const response = await request(app)
        .get('/api/cars?brand=Toyota')
        .set(createAuthHeader(authToken));

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].brand).toBe('Toyota');
    });

    it('should sort cars by price', async () => {
      const response = await request(app)
        .get('/api/cars?sort=price')
        .set(createAuthHeader(authToken));

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data[0].price).toBeLessThanOrEqual(response.body.data[1].price);
    });
  });

  describe('GET /api/cars/:id', () => {
    beforeEach(async () => {
      const car = await Car.create(testCar);
      createdCarId = String(car._id);
    });

    it('should get a car by id', async () => {
      const response = await request(app)
        .get(`/api/cars/${createdCarId}`)
        .set(createAuthHeader(authToken));

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('status', StatusCodes.OK);
      expect(response.body).toHaveProperty('message', 'Car retrieved successfully');
      expect(response.body.data._id).toBe(createdCarId);
    });

    it('should return 404 for non-existent car', async () => {
      const response = await request(app)
        .get('/api/cars/507f1f77bcf86cd799439011') // Random MongoDB ID
        .set(createAuthHeader(authToken));

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('status', StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('error', 'Car not found');
    });
  });

  describe('PUT /api/cars/:id', () => {
    beforeEach(async () => {
      const car = await Car.create(testCar);
      createdCarId = String(car._id);
    });

    it('should update a car', async () => {
      const updates = { price: 27000, color: 'Blue' };
      const response = await request(app)
        .put(`/api/cars/${createdCarId}`)
        .set(createAuthHeader(authToken))
        .send(updates);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('status', StatusCodes.OK);
      expect(response.body).toHaveProperty('message', 'Car updated successfully');
      expect(response.body.data.price).toBe(updates.price);
      expect(response.body.data.color).toBe(updates.color);
    });

    it('should allow partial updates', async () => {
      const partialUpdate = { price: 28000 };
      const response = await request(app)
        .put(`/api/cars/${createdCarId}`)
        .set(createAuthHeader(authToken))
        .send(partialUpdate);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('status', StatusCodes.OK);
      expect(response.body).toHaveProperty('message', 'Car updated successfully');
      expect(response.body.data.price).toBe(partialUpdate.price);
      // Other fields should remain unchanged
      expect(response.body.data.brand).toBe(testCar.brand);
      expect(response.body.data.carModel).toBe(testCar.carModel);
    });

    it('should reject empty update requests', async () => {
      const response = await request(app)
        .put(`/api/cars/${createdCarId}`)
        .set(createAuthHeader(authToken))
        .send({});

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('status', StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', 'No valid fields provided for update');
    });

    it('should reject update requests with only null/undefined values', async () => {
      const response = await request(app)
        .put(`/api/cars/${createdCarId}`)
        .set(createAuthHeader(authToken))
        .send({ price: null, color: undefined });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('status', StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('error', 'No valid fields provided for update');
    });

    it('should not update with invalid data', async () => {
      const response = await request(app)
        .put(`/api/cars/${createdCarId}`)
        .set(createAuthHeader(authToken))
        .send({ price: -1000 }); // Invalid price

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('status', StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('errors');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/cars/${createdCarId}`)
        .send({ price: 30000 });

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body).toHaveProperty('status', StatusCodes.UNAUTHORIZED);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should return 404 for non-existent car', async () => {
      const response = await request(app)
        .put('/api/cars/507f1f77bcf86cd799439011')
        .set(createAuthHeader(authToken))
        .send({ price: 30000 });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('status', StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('error', 'Car not found');
    });
  });

  describe('DELETE /api/cars/:id', () => {
    beforeEach(async () => {
      const car = await Car.create(testCar);
      createdCarId = String(car._id);
    });

    it('should delete a car', async () => {
      const response = await request(app)
        .delete(`/api/cars/${createdCarId}`)
        .set(createAuthHeader(authToken));

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('status', StatusCodes.OK);
      expect(response.body).toHaveProperty('message', 'Car deleted successfully');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/cars/${createdCarId}`);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body).toHaveProperty('status', StatusCodes.UNAUTHORIZED);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should return 404 for non-existent car', async () => {
      const response = await request(app)
        .delete('/api/cars/507f1f77bcf86cd799439011')
        .set(createAuthHeader(authToken));

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('status', StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('error', 'Car not found');
    });

    it('should require admin role to delete', async () => {
      const salesToken = generateToken(TEST_USER_ID, 'sales');
      const response = await request(app)
        .delete(`/api/cars/${createdCarId}`)
        .set(createAuthHeader(salesToken));

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
      expect(response.body).toHaveProperty('status', StatusCodes.FORBIDDEN);
      expect(response.body).toHaveProperty('error', 'Insufficient permissions');
    });
  });
});
