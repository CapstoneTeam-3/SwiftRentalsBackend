// src/routes/auth.js
import { Router } from 'express';
import { AddCar, AddFeature, GetAllCars, ListAllFeatures, GetAllCarsImages, GetCarDetails, UpdateCar } from '../controllers/carController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const car = Router();

car.post('/add-car', authenticate, AddCar);
car.post('/update-car/:id', authenticate, UpdateCar);
car.get('/get-cars', authenticate, GetAllCars);
car.get('/get-car/:id', authenticate, GetCarDetails);
car.get('/get-all-car-images/:imageName', authenticate, GetAllCarsImages);
car.post('/add-feature', authenticate, AddFeature);
car.get('/get-all-features', authenticate, ListAllFeatures);

export default car;
