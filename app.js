import express from "express"

const app = express();

const port = 3000;


app.get("/", (req, res) => {
    res.send("Index Page");
})

app.listen(port, ()=>{
    console.log(`Application is running on ${port}`);
});