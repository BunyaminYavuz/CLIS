import express from "express"
import dotenv from "dotenv"
import conn from "./db.js"
import cookieParser from "cookie-parser"
import pageRoute from "./routes/pageRoute.js"
import computerRoute from "./routes/computerRoute.js"
import categoryRoute from "./routes/categoryRoute.js"
import userRoute from "./routes/userRoute.js"
import { checkUser, authenticateRoles } from "./middlewares/authMiddlewares.js"
import adminRoute from "./routes/adminRoute.js"
import operatorRoute from "./routes/operatorRoute.js"
import studentRoute from "./routes/studentRoute.js"
import { getMainPage } from './controllers/pageController.js'

dotenv.config()

// db connection 
conn()

const app = express();
const port = process.env.PORT || 3001;

// ejs template engine
app.set('view engine', 'ejs');

// static files middleware
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("*", checkUser);

// Sonra role bazlı routelar
app.use("/admin", authenticateRoles("admin"), adminRoute);
app.use("/operator", authenticateRoles("operator"), operatorRoute);
app.use("/student", authenticateRoles("student"), studentRoute);

// En son genel routelar
app.get('/', getMainPage);
app.use("/", pageRoute);
app.use("/users", userRoute);
app.use("/computers", computerRoute);
app.use("/categories", categoryRoute);

app.listen(port, ()=>{
    console.log(`Application is running on ${port}`);
});