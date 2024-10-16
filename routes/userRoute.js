import express from "express";
import * as authController from "../controllers/authController.js"
import * as authMiddleware from "../middlewares/authMiddlewares.js"
const router = express.Router();

router.route("/signup").post(authController.createUser)
router.route("/login").post(authController.loginUser)
router.route("/dashboard").get(authMiddleware.authenticateToken , authController.getDashboardPage)



export default router;