import express from "express";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", adminController.getDashboard);
router.get("/reports", adminController.getReports);
router.get("/labs", adminController.getLabs);
router.get("/labs/:id", adminController.getLabDetails);
router.post("/generate-report", adminController.generateReport);
router.post("/create-operator", adminController.createOperator);

// Computer routes
router.post("/computers", adminController.createComputer);
router.post("/computers/status", adminController.updateComputerStatus);

// Category routes
router.post("/categories", adminController.createCategory);

// Lab routes
router.post("/create-lab", adminController.createLab);

// Session routes
router.post("/end-session/:sessionId", adminController.endSession);

// Announcement routes
router.post("/create-announcement", adminController.createAnnouncement);
router.get("/announcements", adminController.getAnnouncements);
router.get("/announcements/update/:id", adminController.getAnnouncement);
router.post('/announcements/update/:id', adminController.updateAnnouncement);
router.post('/announcements/delete/:id', adminController.deleteAnnouncement);

export default router; 