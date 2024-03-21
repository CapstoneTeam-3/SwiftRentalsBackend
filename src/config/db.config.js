import mongoose from "mongoose";
import { MONGODB_URI } from "../config/index.js";

export const connectMongoDb = () => {
  mongoose.connect(MONGODB_URI, {});

  const db = mongoose.connection;

  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => {
    console.log(`\x1b[30m connected to mongo database... \x1b[0m`);
  });
};
