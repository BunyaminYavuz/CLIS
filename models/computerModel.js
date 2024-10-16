import mongoose from "mongoose";

const { Schema } = mongoose

const computerSchema = new Schema({
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
    },

    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Category"
    },
    isUsed : {
        type:Boolean,
        required:true,
        default:false
    }
})


const Computer = mongoose.model("Computer", computerSchema)

export default Computer;