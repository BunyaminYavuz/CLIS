import mongoose from "mongoose";

const { Schema } = mongoose

const categoryModel = new Schema({
    name : {
        type : String,
        unique : true,
        required : true
    },
})


const Category = mongoose.model("Category", categoryModel)

export default Category;