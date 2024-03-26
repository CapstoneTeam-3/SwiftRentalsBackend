import authRoutes from "./src/routes/auth.js";
import bookingRoutes from "./src/routes/booking.router.js";
import carRoutes from "./src/routes/car.js";
import chatRoutes from "./src/routes/chat.js";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

//create express instance

export const initializeExpress = () => {
  const app = express();
  //enable json body decoding
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  //config cross origin middleware
  app.use(cors());

  app.use("/api/auth", authRoutes);
  app.use("/api/car", carRoutes);
  app.use("/api/booking", bookingRoutes);
  app.use("/api/chat", chatRoutes);

  return app;
};
