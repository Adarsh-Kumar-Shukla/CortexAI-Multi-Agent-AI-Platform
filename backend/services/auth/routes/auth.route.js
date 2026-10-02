import express from "express"
import { login, logOut } from "../controllers/auth.controllers.js"

const router=express.Router()

router.post("/login", login)
router.get("/logout", logOut)

export default router