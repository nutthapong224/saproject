import mongoose from "mongoose";
import Users from "../models/userModel.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail, mailTemplate } from "../utils/email.js";
import ResetTokenUser from "../models/ResetTokenUser.js";

const NumSaltRounds = Number(process.env.NO_OF_SALT_ROUNDS);

export const updateUser = async (req, res) => {
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

    const user = await Users.findByIdAndUpdate(id, updateUser, { new: true });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const token = user.createJWT();
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getUser = async (req, res) => {
  try {
    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ success: false, message: `No User with id ${id}` });
    }

    const user = await Users.findById(id).select("-password");

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
    console.error("Get User Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "You are not registered!" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000);

    await ResetTokenUser.create({
      token: resetToken,
      createdAt,
      expiresAt,
      userId: user._id,
    });

    const mailOption = {
      email: email,
      subject: "Forgot Password Link",
      message: mailTemplate(
        "We have received a request to reset your password. Please reset your password using the link below.",
        `${process.env.FRONTEND_URL}/resetPassword?id=${user._id}&token=${resetToken}`,
        "Reset Password"
      ),
    };
    await sendEmail(mailOption);

    res.json({
      success: true,
      message: "A password reset link has been sent to your email.",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, token, userId } = req.body;
    const userToken = await ResetTokenUser.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!userToken) {
      return res.json({ success: false, message: "Some problem occurred!" });
    }

    const currDateTime = new Date();
    const expiresAt = new Date(userToken.expiresAt);

    if (currDateTime > expiresAt) {
      return res.json({
        success: false,
        message: "Reset Password link has expired!",
      });
    } else if (userToken.token !== token) {
      return res.json({
        success: false,
        message: "Reset Password link is invalid!",
      });
    }

    await ResetTokenUser.deleteMany({ userId });
    const salt = await bcrypt.genSalt(NumSaltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    await Users.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ success: true, message: "Your password reset was successful!" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
