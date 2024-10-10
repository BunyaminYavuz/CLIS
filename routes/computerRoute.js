import express from "express";
import * as computerContorller from "../controllers/computerController.js"

const router = express.Router();

router.route("/").post(computerContorller.createComputer)
router.route("/").get(computerContorller.getAllComputers)
router.route("/:id").get(computerContorller.getComputer)


export default router;