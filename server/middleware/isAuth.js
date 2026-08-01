import jwt from "jsonwebtoken"


const isAuth = (req, res, next) => {

    try {

        let {token} = req.cookies
        if(!token) {
            return res.status(401).json({
                message : "Token is not found",
                success : false
            })
        }

        // if found token then verify
        let verifyToken = jwt.verify(token, process.env.JWT_SECRET)

        if(!verifyToken){
            return res.status(400).json({
                message : "User doesn't have any valid token",
                success : false
            })
        }

        req.userID = verifyToken.userID  // Makes userID available to next controllers
        next()
        
    } catch (error) {

        return res.status(401).json({
                message : "Invalid or expired token",
                success : false
        })
        
    }

}

export default isAuth