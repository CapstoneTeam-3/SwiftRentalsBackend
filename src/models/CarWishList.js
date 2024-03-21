import { Schema, model } from "mongoose";

const CarWishListSchema = new Schema({
  Car: {type: Schema.Types.ObjectId, required: true},
  User: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now }
});

const CarWishList = model("CarWishList", CarWishListSchema);

export default CarWishList;
