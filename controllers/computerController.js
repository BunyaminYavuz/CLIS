import Computer from "../models/computerModel.js";
import Lab from "../models/labModel.js";

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

const getComputersByLab = async (req, res) => {
  try {
    const labId = req.params.labId;
    const computers = await Computer.find({ lab: labId });

    res.status(200).json({
      succeeded: true,
      computers
    });
  } catch (error) {
    console.error("Error fetching computers:", error);
    res.status(500).json({
      succeeded: false,
      error: "An error occurred while fetching computers"
    });
  }
};

export { createComputer, getAllComputers, getComputersByLab };
