
import UserModel from "../models/user.model.js"

export const getCurrentUser = async (req, res) => {

    try {
        
        const userID = req.userID

        const user = await UserModel.findById(userID)
        if(!user){
            return res.status(404).json({
                message : "User is not found",
                success : false
            })
        }

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({
            message : "Internal server error",
            success : false
        })
    }

}