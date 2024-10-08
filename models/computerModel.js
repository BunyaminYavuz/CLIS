import mongoose from "mongoose";

const { Schema } = mongoose

const computerModel = new Schema({
    name : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required: true,
        trim : true
    },
    uploadedAt : {
        type : Date,
        default : Date.now
    }
})


const Computer = mongoose.model("Computer", computerModel)

export default Computer;