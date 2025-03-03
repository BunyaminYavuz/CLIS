import express from "express";
import * as operatorController from "../controllers/operatorController.js";

const router = express.Router();

router.get("/dashboard", operatorController.getDashboard);
router.post("/assign-computer", operatorController.assignComputer);
router.post("/end-session", operatorController.endSession);
router.put("/toggleLabStatus/:id", operatorController.toggleLabStatus);

export default router; 