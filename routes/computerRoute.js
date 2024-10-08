import express from "express";
import * as computerContorller from "../controllers/computerController.js"

const router = express.Router();

router.route("/").post(computerContorller.createComputer)


export default router;