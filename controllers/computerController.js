import Computer from "../models/computerModel.js";
import Category from "../models/categoryModel.js";

const createComputer = async (req, res) => {
  try {
    const computer = await Computer.create(req.body);
    res.status(201).json({
      succeded: true,
      computer,
    });
  } catch (error) {
    res.status(500).json({
        succeded : false,
        error
    })
  }
};


const getAllComputers = async (req, res) => {
  try {
      const categoryId = req.query.categories;

      let category;

      if (categoryId) {
          category = await Category.findOne({ _id: categoryId });
      } else {
          category = await Category.findOne(); // Fetch the first category if categoryId is not provided
      }

      // Filter based on the category found
      let filter = {};
      if (category) {
          filter = { category: category._id };
      }

      const computers = await Computer.find(filter);
      const categories = await Category.find();

      // Render the template
      res.status(200).render("computers", {
          computers,
          categories,
          category,
          link: 'computers',
      });
  } catch (error) {
      res.status(500).json({
          succeeded: false,
          error,
      });
  }
};





export { createComputer, getAllComputers };
