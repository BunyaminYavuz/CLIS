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
      const categoryId = req.query.categories

      const category = await Category.findOne({_id:categoryId})

      let filter = {};

      if(categoryId){
        filter = {category:category._id}
      }

      const computers = await Computer.find(filter);
      const categories = await Category.find()
      res.status(200).render("computers", {
        computers,
        categories,
        link : 'computers'
    })
    } catch (error) {
      res.status(500).json({
          succeded : false,
          error
      })
    }
  };


  const getComputer = async (req, res) => {
    try {
      const computer = await Computer.findById( {_id: req.params.id});
      res.status(200).render("computer", {
        computer,
        link : 'computers'
    })
    } catch (error) {
      res.status(400).json({
          succeded : false,
          error
      })
    }
  };




export { createComputer, getAllComputers, getComputer };
