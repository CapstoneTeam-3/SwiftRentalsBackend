import Cars from "../models/CarModel.js";
import Features from "../models/FeatureModel.js";
import path from "path";
import fs from "fs";
import cloudinary from "cloudinary";
import Ratings from "../models/RatingModel.js";

const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

export const AddCar = async (req, res) => {
  const {
    make,
    model,
    manufacturing_year,
    is_available,
    price,
    description,
    location,
    Features,
    userId
  } = req.body;

  try {
    if (!make || typeof make !== "string") {
      res.status(400).json({ error: "Car Make is Required" });
    }

    if (!model || typeof model !== "string") {
      res.status(400).json({ error: "Car Model is Required" });
    }

    if (!manufacturing_year) {
      res.status(400).json({ error: "Car Manufacturing year is Required" });
    }

    if (!price) {
      res.status(400).json({ error: "Car Price is Required" });
    }

    if (!req.files) {
      res.status(400).json({ error: "Car Image is Required" });
    } else if (
      req.files.some((file) => !allowedFileTypes.includes(file.mimetype))
    ) {
      return res.status(400).json({
        error: "Invalid file type(s). Allowed types are JPEG, JPG, PNG, GIF.",
      });
    }

    const carImages = [];
    for (const file of req.files) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path);
        await DeleteCarImagesLocally(file.path);
        carImages.push(uploadResult);
      } catch (error) {
        console.log(error);
      }
    }

    if (!description || typeof description !== "string") {
      res.status(400).json({ error: "Car Description is Required" });
    }

    if (!location || typeof location !== "string") {
      res.status(400).json({ error: "Car Location is Required" });
    }

    if (!Features) {
      res.status(400).json({ error: "Car Feature is Required" });
    }

    const featuresArray = JSON.parse(Features);

    const newCar = new Cars({
      make,
      model,
      manufacturing_year,
      is_available,
      price,
      User: userId,
      images: carImages,
      description,
      location,
      Features: featuresArray,
    });

    await newCar.save();

    res.json({ message: "Successfully added New Car." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetAllCars = async (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    make,
    model,
    location,
    is_available,
    sort,
  } = req.query;
  try {
    let sortOptions = {};
    if (sort) {
      if (sort === "priceLowToHigh") {
        sortOptions.price = 1;
      } else if (sort === "priceHighToLow") {
        sortOptions.price = -1;
      } else if (sort === "newArrivals") {
        sortOptions.createdAt = -1;
      }
    }

    let filterOptions = {};
    if (make) filterOptions.make = new RegExp(make, "i");
    if (model) filterOptions.model = new RegExp(model, "i");
    if (location) filterOptions.location = new RegExp(location, "i");
    if (is_available) filterOptions.is_available = is_available;

    const totalCars = await Cars.countDocuments(filterOptions);
    const totalPages = Math.ceil(totalCars / pageSize);

    if (page > totalPages) {
      return res.status(404).json({ error: "No Cars found" });
    }

    const cars = await Cars.find(filterOptions)
      .sort(sortOptions)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("Features");

    const carsWithRatings = await Promise.all(cars.map(async (car) => {
      const ratings = await Ratings.find({ car: car._id });
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings : 0;
      return { ...car?._doc, ratings: { count: totalRatings, average: averageRating } };
    }));


  
    res.status(200).json({
      page,
      totalPages,
      pageSize,
      totalCars,
      cars: carsWithRatings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const UpdateCar = async (req, res) => {
  const carId = req.params.id;
  const car = await Cars.findById(carId).populate("Features");

  if (!car) {
    return res.status(404).json({ error: "Car not found" });
  }

  const {
    make,
    model,
    manufacturing_year,
    is_available,
    price,
    description,
    location,
    Features,
    previous_images = [],
    userId
  } = req.body;

  try {
    if (!make || typeof make !== "string") {
      res.status(400).json({ error: "Car Make is Required" });
    }

    if (!model || typeof model !== "string") {
      res.status(400).json({ error: "Car Model is Required" });
    }

    if (!manufacturing_year) {
      res.status(400).json({ error: "Car Manufacturing year is Required" });
    }

    if (!price) {
      res.status(400).json({ error: "Car Price is Required" });
    }

    let previousPublicIds = [];
    if(previous_images && previous_images?.length){
      previousPublicIds = previous_images?.map(image => image.public_id);
    }

    for (const image of car.images) {
        if (!previousPublicIds.includes(image.public_id)) {
            await cloudinary.uploader.destroy(image.public_id);
        }
    }

    const updatedImages = [];
    for (const file of req.files) {
      if (!allowedFileTypes.includes(file.mimetype)) {
        return res
          .status(400)
          .json({ error: `Invalid file type: ${file.originalname}` });
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(file.path);
        await DeleteCarImagesLocally(file.path);
        updatedImages.push(uploadResult);
      } catch (error) {
        console.log(error);
      }
    }

    if (!description || typeof description !== "string") {
      res.status(400).json({ error: "Car Description is Required" });
    }

    if (!location || typeof location !== "string") {
      res.status(400).json({ error: "Car Location is Required" });
    }

    if (!Features) {
      res.status(400).json({ error: "Car Feature is Required" });
    }

    const featuresArray = JSON.parse(Features);

    const updatedCar = await Cars.findByIdAndUpdate(carId, {
      make,
      model,
      manufacturing_year,
      is_available,
      price,
      User: userId,
      images: updatedImages,
      description,
      location,
      Features: featuresArray,
    });

    if (!updatedCar) {
      return res.status(404).json({ error: "Car not found" });
    }

    return res.json({ message: "Car updated successfully", updatedCar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetCarDetails = async (req, res) => {
  const carId = req.params.id;

  try {
    const car = await Cars.findById(carId).populate("Features");
    
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    const carWithRatings = await (async () => {
      const ratings = await Ratings.find({ car: car._id });
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings : 0;
      return { ...car?._doc, ratings: { count: totalRatings, average: averageRating } };
    })();

    return res.json({ car:carWithRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const DeleteCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const existingCar = await Cars.findById(carId);

    if (!existingCar) {
      return res.status(404).json({ error: "Car not found" });
    }
    for (const image of existingCar.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    await Cars.deleteOne({ _id: carId });

    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const DeleteCarImagesLocally = async (imagePath) => {
  try {
    const fullPath = path.join(imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    } else {
      console.log(`File not found: ${fullPath}`);
    }
  } catch (error) {
    console.error("Error deleting images:", error);
    throw error;
  }
};

export const AddFeature = async (req, res) => {
  const { name, icon } = req.body;
  try {
    const newFeature = new Features({
      name,
      icon,
    });
    await newFeature.save();
    res.status(201).json({ message: "Successfully added new feature." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const ListAllFeatures = async (req, res) => {
  try {
    const features = await Features.find();
    res.status(200).json({ features: features });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const AddAvailability = async (req, res) => {
  try {
    const { car_id, dates } = req.body;
    // Find the car by ID
    const car = await Cars.findById(car_id);

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    const invalidDates = dates.filter(date => !/^\d{2}\/\d{2}\/\d{4}$/.test(date));

    if (invalidDates.length > 0) {
      return res.status(400).json({ error: "Invalid date format. Date should be in mm/dd/yyyy format." });
    }

    // Update availability array based on received dates
    dates.forEach((date) => {
      const index = car.availability.findIndex(
        (availability) => availability.date.getTime() === new Date(date).getTime()
      );

      if (index === -1) {
        // Date does not exist, add it to availability
        car.availability.push({ date: new Date(date), is_available: true });
      }
    });

    await car.save();

    return res.status(200).json({ message: "Availability added successfully" });
  } catch (error) {
    console.error("Error updating availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const ListAvailability = async (req, res) => {
  try {
    const { car_id } = req.query;
    // Find the car by ID
    const car = await Cars.findById(car_id);

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    return res.status(200).json({ availability: car.availability });
  } catch (error) {
    console.error("Error updating availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const DeleteAvailability = async (req, res) => {
  try {
    const { car_id } = req.query;
    // Find the car by ID
    const car = await Cars.findById(car_id);

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    let deletedAvailability = false;

    dates.forEach((date) => {
      const index = car.availability.findIndex(
        (availability) => availability.date.getTime() === new Date(date).getTime()
      );

      if (index !== -1) {
        deletedAvailability = true;
        car.availability.splice(index, 1);
      }
    });
    if (deletedAvailability) {

      await car.save();

      return res.status(200).json({ availability: car.availability });
    }
    return res.status(404).json({ message: "Availability not found" });
  } catch (error) {
    console.error("Error updating availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const ModifyAvailability = async (req, res) => {
  try {
    const { car_id, availability } = req.body;
    // Find the car by ID
    const car = await Cars.findById(car_id);

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    let modifiedAvailability = false;

    availability.forEach(({ date, is_available }) => {
      const index = car.availability.findIndex(
        (availability) => availability.date.getTime() === new Date(date).getTime()
      );

      if (index !== -1) {
        modifiedAvailability = true;
        car.availability[index].is_available = is_available ?? false;
      }
    });
    if (modifiedAvailability) {

      await car.save();

      return res.status(200).json({ availability: car.availability });
    }
    return res.status(404).json({ message: "Availability not found" });
  } catch (error) {
    console.error("Error updating availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}