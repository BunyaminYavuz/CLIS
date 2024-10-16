import mongoose from "mongoose";

const { Schema } = mongoose

const userModel = new Schema({
    name : {
        type : String,
        required : true
    },
    lastname : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    }

})


const User = mongoose.model("User", userModel)

export default User;