import Category from "../models/categoryModel.js";

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      succeded: true,
      category,
    });
  } catch (error) {
    res.status(400).json({
      succeded: false,
      error,
    });
  }
};

export { createCategory };
