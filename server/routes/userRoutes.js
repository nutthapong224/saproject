import express from "express";
import userAuth from "../middleware/authmiddleware.js";
import { getUser, updateUser } from "../conteollers/userController.js";

const router = express.Router();

// Get user
router.get("/get-user", userAuth, getUser);

// Update user
router.put("/update-user", userAuth, updateUser);

export default router;
