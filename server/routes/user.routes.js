import express from "express";
import {signup,login,logout, updateUser} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";

const router=express.Router();

router.post("update-user",authenticate,updateUser)
router.get("/user",authenticate, getUser)


router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)

export default router;