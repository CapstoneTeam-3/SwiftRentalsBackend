// src/routes/auth.js
import { Router } from "express";
import { AddRating, DeleteRating, GetRatings } from "../controllers/ratingController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const rating = Router();

rating.post("/add-rating", AddRating);
rating.get("/get-ratings", GetRatings);
rating.delete("/delete-rating/:id", DeleteRating);


export default rating;
