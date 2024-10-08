import express from "express"
import dotenv from "dotenv"
import conn from "./db.js"

dotenv.config()

// db connection 
conn()

const app = express();
const port = process.env.PORT;

// ejs template engine
app.set("view engine", "ejs")

// static files middleware
app.use(express.static("public"))

app.get("/", (req, res) => {
    res.render("index");
})

app.listen(port, ()=>{
    console.log(`Application is running on ${port}`);
});