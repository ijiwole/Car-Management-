import express from 'express';
import * as carController from '../controllers/car.controller';
import { auth, checkRole } from '../middleware/auth';
import { carValidation, carUpdateValidation } from '../middleware/validate';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

router.get('/', carController.getCars);
router.get('/:id', carController.getCarById);

router.post('/', 
  checkRole(['admin', 'manager']), 
  carValidation, 
  carController.createCar
);

router.put('/:id', 
  checkRole(['admin', 'manager']), 
  carUpdateValidation,
  carController.updateCar
);

router.delete('/:id', 
  checkRole(['admin']), 
  carController.deleteCar
);

export default router;