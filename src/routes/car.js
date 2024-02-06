// src/routes/auth.js
import { Router } from 'express';
import { AddCar, AddFeature, GetAllCars } from '../controllers/carController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const car = Router();

car.post('/add-car', authenticate, AddCar);
car.get('/get-cars', authenticate, GetAllCars);
car.post('/add-feature', authenticate, AddFeature);

export default car;
