import Computer from "../models/computerModel.js";

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
      const computers = await Computer.find({});
      res.status(200).json({
        succeded: true,
        computers,
      });
    } catch (error) {
      res.status(500).json({
          succeded : false,
          error
      })
    }
  };




export { createComputer, getAllComputers };
