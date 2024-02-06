import { Schema, model } from "mongoose";

const FeatureSchema = new Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
});

const Feature = model("Feature", FeatureSchema);
export default Feature;
