import { getAuth } from "firebase-admin/auth";
import crypto from "crypto";
import app from "../config/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Firebase token is required",
      });
    }

    const decoded = await getAuth(app).verifyIdToken(token);

    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
      });
    }

    const sessionId = crypto.randomUUID();
    await redis.set(`session-${sessionId}`, JSON.stringify({
      userId:user._id,
      name:user.name,
      email:user.email,
      avatar:user.avatar
    }), "EX", 7*24*60*60)

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: `Login error: ${error.message}`,
    });
  }
};


export const logOut=async (req, res)=>{
  try {
    const sessionId=req.cookies?.session
    await redis.del(`session-${sessionId}`)
    res.clearCookie("session")
    return res.status(200).json({message:"logout successfully"})
  } catch (error) {
    return res.status(500).json({
      message: `Logout error: ${error.message}`,
    });
  }
}