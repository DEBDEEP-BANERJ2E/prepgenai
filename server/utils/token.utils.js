import jwt from "jsonwebtoken"

const getToken = (userID) =>{

    try {
        
        const token = jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: "7d"})
        console.log(token)
        return token
        

    } catch (error) {
        console.log(error);
        
    }

}

export default getToken