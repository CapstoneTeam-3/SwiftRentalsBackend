// src/routes/auth.js
import { Router } from 'express';
import { AddCar, AddFeature, GetAllCars, ListAllFeatures, GetCarDetails, UpdateCar, DeleteCar, AddAvailability, ListAvailability, DeleteAvailability } from '../controllers/carController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const car = Router();

car.post('/add-car', authenticate, AddCar);
car.post('/update-car/:id', authenticate, UpdateCar);
car.get('/get-cars', authenticate, GetAllCars);
car.get('/get-car/:id', authenticate, GetCarDetails);
car.post('/add-feature', authenticate, AddFeature);
car.delete('/delete-car/:id', authenticate, DeleteCar);
car.get('/get-all-features', authenticate, ListAllFeatures);
// Car Availability 
car.post('/add-availability', AddAvailability);
car.get('/list-availability/:id', ListAvailability);
car.delete('/delete-availability', DeleteAvailability);
car.get('/modify-availability', ListAvailability);

export default car;
