import express from "express"
import dotenv from "dotenv"
import conn from "./db.js"
import cookieParser from "cookie-parser"
import pageRoute from "./routes/pageRoute.js"
import computerRoute from "./routes/computerRoute.js"
import categoryRoute from "./routes/categoryRoute.js"
import userRoute from "./routes/userRoute.js"
import { checkUser } from "./middlewares/authMiddlewares.js"

dotenv.config()

// db connection 
conn()

const app = express();
const port = process.env.PORT;

// ejs template engine
app.set('view engine', 'ejs');

// static files middleware
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());


// routes
app.get("*", checkUser);
app.use("/", pageRoute)
app.use("/users",userRoute)
app.use("/computers", computerRoute)
app.use("/categories",categoryRoute)


app.listen(port, ()=>{
    console.log(`Application is running on ${port}`);
});