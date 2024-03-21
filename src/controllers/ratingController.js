import Ratings from "../models/RatingModel.js";

export const AddRating = async (req, res) => {
    const {
        car_id,
        user_id,
        rating
    } = req.body;

    try {
        if (!car_id || typeof car_id !== "string") {
            return res.status(400).json({ error: "Car id is Required" });
        }

        if (!user_id || typeof user_id !== "string") {
            return res.status(400).json({ error: "User id is Required" });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating is Required. Must be between 1 to 5." });
        }

        const existingRating = await Ratings.findOne({ car: car_id, user: user_id });

        if (existingRating) {
            return res.status(404).json({ error: "Rating already exists" });
        }
        const newRating = new Ratings({
            car: car_id,
            user: user_id,
            rating
        });

        await newRating.save();

        res.json({ message: "Successfully added rating." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const DeleteRating = async (req, res) => {
    try {
        const ratingId = req.params.id;
        const existingRating = await Ratings.findById(ratingId);

        if (!existingRating) {
            return res.status(404).json({ error: "Rating not found" });
        }
        await Ratings.deleteOne({ _id: ratingId });

        res.json({ message: "Rating deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const GetRatings = async (req, res) => {
    try {
        const ratings = await Ratings.find();

        res.json({ ratings });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};