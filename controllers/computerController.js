import Computer from "../models/computerModel";

const createComputer = (req, res) => {
    const computer = Computer.create(req.body);
    res.status(201).json({
        succeded : true,
        computer
    })
}


export { createComputer }