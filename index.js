// app.js or index.js
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { MONGODB_URI, PORT } from "./src/config/index.js";
import authRoutes from "./src/routes/auth.js";
import bookingRoutes from "./src/routes/booking.router.js";
import carRoutes from "./src/routes/car.js";
import chatRoutes from "./src/routes/chat.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

mongoose.connect(MONGODB_URI, {});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/car", carRoutes);
app.use("/api/booking", bookingRoutes);
app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
  console.log(`\x1b[36m listening on port ${PORT}...\x1b[0m`);
});
