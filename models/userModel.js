import mongoose from "mongoose";
import bcrypt, { hash } from "bcrypt"

const { Schema } = mongoose

const userSchema = new Schema({
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
    },
},
{
    timestamps: true,
}
);


userSchema.pre("save", function(next) {
    const user = this
    bcrypt.hash(user.password, 10, (err, hash) => {
        user.password = hash
        next();
    })
} )





const User = mongoose.model("User", userSchema)

export default User;