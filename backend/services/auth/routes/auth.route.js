import express from "express"
import { login, logOut, updateUserPayment } from "../controllers/auth.controllers.js"

const router=express.Router()

router.post("/login", login)
router.get("/logout", logOut)
router.post("/update-plan", updateUserPayment)

export default router