import express from "express";
import * as studentController from "../controllers/studentController.js";

const router = express.Router();

router.get("/dashboard", studentController.getStudentDashboard);
router.get("/lab-history", studentController.getLabHistory);
router.get("/lab-computer-status", studentController.getLabComputerStatus);
router.get("/opt-programs", studentController.getPrograms);

export default router; 