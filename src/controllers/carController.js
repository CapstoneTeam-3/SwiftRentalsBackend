import Cars from "../models/CarModel.js";
import Features from "../models/FeatureModel.js";

export const AddCar = async (req, res) => {
  const {
    make,
    model,
    manufacturing_year,
    is_available,
    price,
    User,
    images,
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

    if (
      !manufacturing_year ||
      typeof manufacturing_year !== "number" ||
      !Number.isInteger(manufacturing_year)
    ) {
      res.status(400).json({ error: "Car Manufacturing year is Required" });
    }

    if (!price || typeof price !== "number" || !Number.isInteger(price)) {
      res.status(400).json({ error: "Car Price is Required" });
    }

    if (!images) {
      res.status(400).json({ error: "Car Image is Required" });
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

    const newCar = new Cars({
      make,
      model,
      manufacturing_year,
      is_available,
      price,
      User: userId,
      images,
      description,
      location,
      Features,
    });

    await newCar.save();

    res.json({ message: "Successfully added New Car." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetAllCars = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10; 
    
        const totalCars = await Cars.countDocuments();
        const totalPages = Math.ceil(totalCars / pageSize);
    
        if (page > totalPages) {
          return res.status(404).json({ error: 'Page not found' });
        }
    
        const cars = await Cars.find()
          .skip((page - 1) * pageSize)
          .limit(pageSize);
    
        res.json({
          page,
          totalPages,
          pageSize,
          totalCars,
          cars,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }  
};

export const UpdateCar = async (req, res) => {};

export const DeleteCar = async (req, res) => {
    try {
        const carId = req.params.id;
    
        const existingCar = await Cars.findById(carId);
        if (!existingCar) {
          return res.status(404).json({ error: 'Car not found' });
        }
    
        await existingCar.remove();
    
        res.json({ message: 'Car deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
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
    res.json({ message: "Successfully added new feature." });
  } catch (error) {
    console.error("Error adding feature:", error);
    throw error;
  }
};
