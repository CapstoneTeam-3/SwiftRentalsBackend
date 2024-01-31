// app.js or index.js
import express from "express";
import bodyParser from 'body-parser';
import mongoose from "mongoose";
import { PORT, MONGODB_URI } from './src/config/index.js'
import authRoutes from "./src/routes/auth.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(MONGODB_URI, {});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
  res.send("Hello World!");
});

app.use('/api', authRoutes);

app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`);
});
