import { Schema, model } from "mongoose";

const CarSchema = new Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  manufacturing_year: { type: Number, required: true },
  is_available: { type: Boolean, required: true, default:false },
  price: { type: Number, required: true },
  User: { type: Schema.Types.ObjectId, required: true },
  images: { type: [Object], required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  Features: [{ type: Schema.Types.ObjectId, ref: 'Feature', required: true }],
  createdAt: { type: Date, default: Date.now }
});

const Cars = model("Cars", CarSchema);  

export default Cars;
