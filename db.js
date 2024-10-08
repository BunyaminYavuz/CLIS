import mongoose from "mongoose";

const conn = () => {
    mongoose.connect(process.env.DB_URL,{
        dbName:"clis",
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(() => {
        console.log("Connected to the DB successfully")
    }).catch((err)=>{
        console.log(`Connection error to the DB ${err}`);
    })
}

export default conn;