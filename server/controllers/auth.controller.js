import UserModel from "../models/user.model.js";
import getToken from "../utils/token.utils.js";

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({ name, email });
    }

    const token = getToken(user._id);

    // 🔥 CORRECT COOKIE CONFIG
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true only in production
      sameSite: "lax", // IMPORTANT
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Sign in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      sameSite: "lax",
      secure: false,
    });

    return res.status(200).json({
      success: true,
      message: "Log out successfully",
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
