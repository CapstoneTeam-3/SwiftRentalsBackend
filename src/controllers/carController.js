import Cars from "../models/CarModel.js";
import Features from "../models/FeatureModel.js";
import path from "path";
import multer from "multer";
import fs from "fs";
import { uid } from "uid";

const maxFiles = 5;
const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const imageUniqueName =
  new Date().toISOString().split("T")[0] + "-" + uid(16) + "-";

const storage = multer.diskStorage({
  destination: "./public/uploads/carimages/",
  filename: function (req, file, cb) {
    cb(null, imageUniqueName + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Allowed types are JPEG, JPG, PNG, GIF."),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).array("images", maxFiles);

export const AddCar = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Unknown error" });
    } else {
      const {
        make,
        model,
        manufacturing_year,
        is_available,
        price,
        description,
        location,
        Features,
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
            error:
              "Invalid file type(s). Allowed types are JPEG, JPG, PNG, GIF.",
          });
        } else if (req.files.length > maxFiles) {
          return res.status(400).json({
            error: `Cannot upload more than ${maxFiles} images.`,
          });
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

        const userId = req.user.userId;
        const imagePaths = req.files.map(
          (file) => imageUniqueName + file.originalname
        );
        const featuresArray = JSON.parse(Features);

        const newCar = new Cars({
          make,
          model,
          manufacturing_year,
          is_available,
          price,
          User: userId,
          images: imagePaths,
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
    }
  });
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
      return res.status(404).json({ error: "Page not found" });
    }

    const cars = await Cars.find(filterOptions)
      .sort(sortOptions)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("Features");

    const carsWithImages = cars.map((car) => {
      // const imagesData = car.images.map((imageName) => {
      //   const imagePath = path.join(
      //     __dirname,
      //     "../../public/uploads/carimages",
      //     imageName
      //   );
      //   try {
      //     const imageData = fs.readFileSync(imagePath, "base64");
      //     return {
      //       name: imageName,
      //       data: imageData,
      //     };
      //   } catch (error) {
      //     return null;
      //   }
      // }).filter((imageData) => imageData !== null);

      return {
        ...car._doc,
        // images: imagesData,
      };
    });

    res.status(200).json({
      page,
      totalPages,
      pageSize,
      totalCars,
      cars: carsWithImages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const UpdateCar = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Unknown error" });
    }

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
      } else if (req.files.length > maxFiles) {
        return res.status(400).json({
          error: `Cannot upload more than ${maxFiles} images.`,
        });
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

      const imagePaths = req.files.map(
        (file) => imageUniqueName + file.originalname
      );

      if (car.images && Array.isArray(car.images)) {
        const oldCarImages = car.images.map((filename) => filename);
        await DeleteImages(oldCarImages);
      }

      const userId = req.user.userId;
      const featuresArray = JSON.parse(Features);

      const updatedCar = await Cars.findByIdAndUpdate(carId, {
        make,
        model,
        manufacturing_year,
        is_available,
        price,
        User: userId,
        images: imagePaths,
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
  });
};

export const GetCarDetails = async (req, res) => {
  const carId = req.params.id;

  try {
    const car = await Cars.findById(carId).populate("Features");

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    return res.json({ car });
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

    await Cars.deleteOne({ _id: carId });

    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const DeleteImages = async (imagePaths) => {
  try {
    for (const imagePath of imagePaths) {
      const fullPath = path.join("./public/uploads/carimages", imagePath);

      console.log(fullPath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      } else {
        console.log(`File not found: ${fullPath}`);
      }
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

    const invalidDates = dates.filter(dateObj => !/^\d{2}-\d{2}-\d{4}$/.test(dateObj.date));

    if (invalidDates.length > 0) {
      return res.status(400).json({ error: "Invalid date format. Date should be in mm-dd-yyyy format." });
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

    // Save the updated car
    await car.save();

    return res.status(200).json({ message: "Availability added successfully" });
  } catch (error) {
    console.error("Error updating availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const ListAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the car by ID
    const car = await Cars.findById(id);

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    return res.status(200).json({ availability: car.availability });
  } catch (error) {
    console.error("Error updating availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}