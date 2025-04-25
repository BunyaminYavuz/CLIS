import express from "express";
import * as authController from "../controllers/authController.js"
import * as authMiddleware from "../middlewares/authMiddlewares.js"

const router = express.Router();

router.route("/signup").post(authController.createUser)
router.route("/login").post(authController.loginUser)
router.route("/dashboard").get(authMiddleware.authenticateToken , authController.getDashboardPage)
router.route("/computer/:id").get(authMiddleware.authenticateToken, authController.getComputer)
router.route("/labs").get(authMiddleware.authenticateToken, authController.getLabs)
router.route("/rfid").post(authMiddleware.authenticateRfid(), authController.handleRFID);



export default router;