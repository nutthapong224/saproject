import express from "express";
import userAuth from "../middleware/authmiddleware.js";
import { getUser, updateUser,forgotPassword,resetPassword } from "../conteollers/userController.js";

const router = express.Router();

// Get user
router.get("/get-user", userAuth, getUser);

// Update user
router.put("/update-user", userAuth, updateUser); 
// Forgot Password Route
router.post("/forgotPassword", forgotPassword);

// Reset Password Route
router.post("/resetPassword", resetPassword); 

export default router;
