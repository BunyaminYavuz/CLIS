import express from "express";
import * as operatorController from "../controllers/operatorController.js";

const router = express.Router();

router.get("/dashboard", operatorController.getDashboard);

// Computer assign routes
router.post("/assign-computer", operatorController.assignComputer);
router.post("/end-session", operatorController.endSession);

// Lab routes
router.get("/labStatus", operatorController.getLabStatus);
router.put("/toggleLabStatus/:id", operatorController.toggleLabStatus);

// Student routes
router.get("/scannedStudent", operatorController.scannedStudent);

// Computer update routes
router.get('/computerStatus/:id', operatorController.getComputerStatusPage);
router.post('/computerStatus/update', operatorController.updateComputerStatus);

// Operator Week Proggram
router.get("/program", operatorController.getPrograms);
router.post("/program/update-slot", operatorController.updateProgramSlot);
router.post('/program/delete-slot', operatorController.deleteProgramSlot);


export default router; 