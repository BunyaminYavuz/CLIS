import express from "express";
import * as pageContorller from "../controllers/pageController.js"

const router = express.Router();

router.route("/").get(pageContorller.getIndexPage)
router.route("/about").get(pageContorller.getAboutPage)
router.route("/contact").get(pageContorller.getContactPage)
router.route("/register").get(pageContorller.getRegisterPage)

export default router;