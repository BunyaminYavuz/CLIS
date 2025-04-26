import express from "express";
import * as operatorController from "../controllers/operatorController.js";

const router = express.Router();

router.get("/dashboard", operatorController.getDashboard);
router.post("/assign-computer", operatorController.assignComputer);
router.post("/end-session", operatorController.endSession);
router.put("/toggleLabStatus/:id", operatorController.toggleLabStatus);
router.get("/scannedStudent", operatorController.scannedStudent);
router.get("/labStatus", operatorController.getLabStatus);

export default router; 