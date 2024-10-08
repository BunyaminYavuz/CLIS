import express from "express"

const app = express();

const port = 3000;

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