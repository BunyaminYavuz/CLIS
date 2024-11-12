import User from "../models/userModel.js";
import Category from "../models/categoryModel.js"
import Computer from "../models/computerModel.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      succeded: true,
      user : user._id,
    });
  } catch (error) {
    let errors2 = {}

    if (error.code === 11000) {
      errors2.email = "The Email is already registered!"
    }    


    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors2[key] = error.errors[key].message
      })
    }

    console.log("Errors2", errors2);
    

    res.status(400).json(errors2)
  }
};

const loginUser = async (req, res) => {
    try {
      const {email, password} = req.body;

      const user = await User.findOne({email : email})

      let same = false

      if (user)  {
        same = await bcrypt.compare(password, user.password)
      } else{
        return res.status(401).json({
            succeded: false,
            error: "There is no user"
        })
        
      }


      if (same) {

        const token = createToken(user._id);
        res.cookie("jwt", token, {
          httpOnly:true,
          maxAge:1000 * 60 * 60 * 24
        })

        res.redirect("/users/dashboard")
      } else {
        res.status(401).json({
            succeded: true,
            error: "Password are not matched!"
        })
      }




    } catch (error) {
      res.status(400).json({
        succeded: false,
        error,
      });
    }
  };


  const getDashboardPage = async (req, res) => {
    try {
        let categoryId = req.query.categories || null; // Default to null if no categoryId is provided
        let category = null;
        let filter = {};


        if (categoryId) {
            category = await Category.findOne({ _id: categoryId });
            if (category) {
                filter = { category: category._id }; // Apply filter if the category exists
            }
        } else {
            // If no categoryId, select the first category as default
            category = await Category.findOne();
            if (category) {
                categoryId = category._id; // Set the first category as the active one
                filter = { category: category._id };
            }
        }

        const computers = await Computer.find(filter); // Fetch computers for the selected category
        const categories = await Category.find(); // Fetch all categories

        // Render the template with the data
        res.status(200).render("dashboard", {
            computers,
            categories,
            category, // Ensure category is passed to the view, even if it's null
            categoryId,
            link: 'dashboard',
        });
    } catch (error) {
        res.status(500).json({
            succeeded: false,
            error,
        });
    }
};




  const getLabs = async (req, res) => {
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
        res.status(200).render("labs", {
            computers,
            categories,
            category,
            categoryId,
            link: 'labs',
        });
    } catch (error) {
        res.status(500).json({
            succeeded: false,
            error,
        });
    }
  };


  const getComputer = async (req, res) => {
    try {
      const computer = await Computer.findById( {_id: req.params.id});
      res.status(200).render("computer", {
        computer,
        link : 'labs'
    })
    } catch (error) {
      res.status(400).json({
          succeded : false,
          error
      })
    }
  };




  const createToken = (userId) => {
    return jwt.sign({userId},process.env.JWT_SECRET,{
      expiresIn:"1d",
    })
  }

export { createUser, loginUser,createToken, getDashboardPage , getComputer, getLabs};
