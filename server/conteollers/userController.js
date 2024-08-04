import mongoose from "mongoose";
import Users from "../models/userModel.js";

export const updateUser = async (req, res, next) => {
  const {
    firstName,
    lastName,
   
    contact,
    location,
    profileUrl,
    jobTitle,
    about,
  } = req.body;

  try {
    // Validate required fields
    if (
      !firstName ||
      !lastName ||
   
      !contact ||
      !location ||
      !profileUrl ||
      !jobTitle ||
      !about
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }



    const id = req.body.user.userId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ success: false, message: `No User with id ${id}` });
    }

    const updateUser = {
      firstName,
      lastName,
    
      contact,
      location,
      profileUrl,
      jobTitle,
      about,
    };

    // Update user
    const user = await Users.findByIdAndUpdate(id, updateUser, { new: true });

    // Check if user was found and updated
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate a new token
    const token = user.createJWT();
    user.password = undefined; // Exclude password from the response

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ success: false, message: `No User with id ${id}` });
    }

    const user = await Users.findById(id).select("-password"); // Exclude password from the response

    // Check if user was found
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Auth error",
      error: error.message,
    });
  }
};
