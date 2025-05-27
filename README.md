# Car Dealer Management System

A RESTful API for managing a car dealership, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication and authorization (Admin, Manager, Sales roles)
- Car inventory management (CRUD operations)
- Car filtering and search capabilities
- Role-based access control

## Tech Stack

- Node.js & Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Jest & Supertest for testing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/car-dealer-management.git
cd car-dealer-management
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/car-dealer
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Cars
- `POST /api/cars` - Create a new car (Admin/Manager only)
- `GET /api/cars` - Get all cars with filtering
- `GET /api/cars/:id` - Get a specific car
- `PUT /api/cars/:id` - Update a car (Admin/Manager only)
- `DELETE /api/cars/:id` - Delete a car (Admin only)

## License

MIT 