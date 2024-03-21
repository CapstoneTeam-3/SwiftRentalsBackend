import { Schema, model } from "mongoose";

const RatingSchema = new Schema({
    car: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true }
});

const Ratings = model("Ratings", RatingSchema);

export default Ratings;
