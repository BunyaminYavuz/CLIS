import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      succeded: true,
      user,
    });
  } catch (error) {
    res.status(400).json({
      succeded: false,
      error,
    });
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


  const getDashboardPage = (req, res) =>{
    res.render("dashboard",{
        link:'dashboard'
    });
}

  const createToken = (userId) => {
    return jwt.sign({userId},process.env.JWT_SECRET,{
      expiresIn:"1d",
    })
  }

export { createUser, loginUser,createToken, getDashboardPage };
