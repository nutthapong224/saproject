import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Ensure bcrypt is imported
import crypto from "crypto"; // Ensure crypto is imported
import Companies from "../models/companiesModel.js";
import ResetTokenCompany from "../models/ResetTokencompany.js";
import { response } from "express";
import { sendEmail, mailTemplate } from "../utils/email.js"; // Ensure correct import

const NumSaltRounds = Number(process.env.NO_OF_SALT_ROUNDS);

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Company name is required" });
  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email address is required" });
  if (!password || password.length < 6)
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });

  try {
    const accountExist = await Companies.findOne({ email });
    if (accountExist)
      return res
        .status(400)
        .json({ success: false, message: "Email Address already exists" });

    const company = await Companies.create({ name, email, password });

    const token = company.createJWT();
    res.status(201).json({
      success: true,
      message: "Company account created successfully",
      user: { _id: company._id, name: company.name, email: company.email },
      token,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Please provide user credentials" });

  try {
    const company = await Companies.findOne({ email }).select("+password");
    if (!company)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const isMatch = await company.comparePassword(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    company.password = undefined;
    const token = company.createJWT();
    res.status(200).json({
      success: true,
      message: "Login successfully",
      user: company,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const updateCompanyProfile = async (req, res, next) => {
  const { name, contact, location, profileUrl, about } = req.body;
  const id = req.body.user.userId;

  if (!name || !location || !about || !contact || !profileUrl)
    return res
      .status(400)
      .json({ success: false, message: "Please provide all required fields" });

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No company with id: ${id}`);

  try {
    const updateCompany = {
      name,
      contact,
      location,
      profileUrl,
      about,
      _id: id,
    };
    const company = await Companies.findByIdAndUpdate(id, updateCompany, {
      new: true,
    });

    if (!company) return res.status(404).send(`No company with id: ${id}`);

    const token = company.createJWT();
    company.password = undefined;

    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      company,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyProfile = async (req, res, next) => {
  const id = req.body.user.userId;

  try {
    const company = await Companies.findById(id);

    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Company Not Found" });

    company.password = undefined;
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getCompanies = async (req, res, next) => {
  const { search, sort, location } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const queryObject = {};
  if (search) queryObject.name = { $regex: search, $options: "i" };
  if (location) queryObject.location = { $regex: location, $options: "i" };

  try {
    let queryResult = Companies.find(queryObject).select("-password");

    if (sort === "Newest") queryResult = queryResult.sort("-createdAt");
    if (sort === "Oldest") queryResult = queryResult.sort("createdAt");
    if (sort === "A-Z") queryResult = queryResult.sort("name");
    if (sort === "Z-A") queryResult = queryResult.sort("-name");

    const total = await Companies.countDocuments(queryObject);
    const numOfPage = Math.ceil(total / limit);

    queryResult = queryResult.skip(skip).limit(limit);
    const companies = await queryResult;

    res.status(200).json({
      success: true,
      total,
      data: companies,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyJobListing = async (req, res, next) => {
  const { search, sort } = req.query;
  const id = req.body.user.userId;

  try {
    const queryObject = {};
    if (search) queryObject.location = { $regex: search, $options: "i" };

    let sorting = {};
    if (sort === "Newest") sorting = { createdAt: -1 };
    if (sort === "Oldest") sorting = { createdAt: 1 };
    if (sort === "A-Z") sorting = { name: 1 };
    if (sort === "Z-A") sorting = { name: -1 };

    const company = await Companies.findById(id).populate({
      path: "JobPosts",
      match: queryObject,
      options: { sort: sorting },
    });

    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });

    res.status(200).json({ success: true, companies: company.JobPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyByID = async (req, res, next) => {
  const id = req.params.id;

  try {
    const company = await Companies.findById(id).populate({
      path: "jobPosts",
      options: { sort: "-_id" },
    });

    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Company not found" })

    company.password = undefined;
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Companies.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "You are not registered!" });

    const token = crypto.randomBytes(20).toString("hex");
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000);

    await ResetTokenCompany.create({
      token: resetToken,
      createdAt,
      expiresAt,
      userId: user._id,
    });

    const mailOption = {
      email,
      subject: "Forgot Password Link",
      message: mailTemplate(
        "We have received a request to reset your password. Please reset your password using the link below.",
        `${process.env.FRONTEND_URL}/resetPasswordCompany?id=${user._id}&token=${resetToken}`,
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
    const userToken = await ResetTokenCompany.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!userToken) {
      return res.json({
        success: false,
        message: "Some problem occurred!",
      });
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

    await ResetTokenCompany.deleteMany({ userId });
    const salt = await bcrypt.genSalt(NumSaltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    await Companies.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({
      success: true,
      message: "Your password reset was successful!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
