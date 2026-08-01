import mongoose, { Mongoose } from "mongoose";

const userSchema = new mongoose.Schema(
    {   
        name : {
            type : String,
            required : true,
        },
        email : {
            type : String,
            required : true,
            unique : true,
        },
        credits : {
            type : Number,
            default : 50,
        },
        isCreditAvialable : {
            type : Boolean,
            default : true,
        },
        notes : {
            type : [mongoose.Schema.Types.ObjectId],
            ref : "Notes",
            default : []
        }

    }, {
        timestamps:true
    }
)

const UserModel = mongoose.model("UserModel" , userSchema)

export default UserModel