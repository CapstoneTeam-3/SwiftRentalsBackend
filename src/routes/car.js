// src/routes/auth.js
import { Router } from "express";
import {
  AddCar,
  AddFeature,
  GetAllCars,
  ListAllFeatures,
  GetCarDetails,
  UpdateCar,
  DeleteCar,
  AddAvailability,
  ListAvailability,
  DeleteAvailability,
  ModifyAvailability,
  TriggerCarToWishlist,
  GetCarsInWishlist
} from "../controllers/carController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import multer from "multer";
import fs from "fs";

const car = Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const destination = "./public/uploads/carimages";
    try {
      if (!fs.existsSync(destination)) {
        await fs.promises.mkdir(destination, { recursive: true });
      }
      cb(null, destination);
    } catch (error) {
      console.error(`Error creating folder: ${error.message}`);
      cb(new Error("Failed to create destination folder"), false);
    }
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const maxFiles = 5;
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

car.post("/add-car", authenticate, upload.array("images", maxFiles), AddCar);
car.put(
  "/update-car/:id",
authenticate,
  upload.array("images", maxFiles),
  UpdateCar
);
car.get("/get-cars", authenticate, GetAllCars);
car.get("/get-car/:id", authenticate, GetCarDetails);
car.post("/add-feature", authenticate, AddFeature);
car.delete("/delete-car/:id", authenticate, DeleteCar);
car.get("/get-all-features", authenticate, ListAllFeatures);
car.post("/trigger-car-to-wishlist",authenticate, TriggerCarToWishlist);
car.get("/get-cars-in-wishlist",authenticate, GetCarsInWishlist);

// Car Availability
car.post("/add-availability", AddAvailability);
car.get("/list-availability", ListAvailability);
car.delete("/delete-availability", DeleteAvailability);
car.put("/modify-availability", ModifyAvailability);

export default car;
