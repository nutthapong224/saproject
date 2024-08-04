import mongoose from "mongoose";
import Companies from "../models/companiesModel.js";
import { response } from "express";

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate fields
  if (!name) {
    return next(new Error("Company name is required"));
  }
  if (!email) {
    return next(new Error("Email address is required"));
  }
  if (!password || password.length < 6) {
    return next(
      new Error("Password is required and must be at least 6 characters long")
    );
  }

  try {
    const accountExist = await Companies.findOne({ email });

    if (accountExist) {
      return next(new Error("Email already registered, please login"));
    }

    // Create a new company account
    const company = await Companies.create({
      name,
      email,
      password,
    });

    // Generate JWT token
    const token = company.createJWT();
    res.status(201).json({
      success: true,
      message: "Company account created successfully",
      user: {
        _id: company._id,
        name: company.name,
        email: company.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    next(error); // Pass the error to the error-handling middleware
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      next("Please provide user credentials");
      return;
    }

    const company = await Companies.findOne({ email }).select("+password");
    if (!company) {
      next("Invalid email or password");
      return;
    }

    // Compare password
    const isMatch = await company.comparePassword(password);
    if (!isMatch) {
      next("Invalid email or password");
      return;
    }

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
    res.status(404).json({ message: error.message });
  }
};

export const updateCompanyProfile = async (req, res, next) => {
  const { name, contact, location, profileUrl, about } = req.body;

  try {
    // Check if all required fields are provided
    if (!name || !location || !about || !contact || !profileUrl) {
      next("Please provide all required fields");
      return;
    }

    const id = req.body.user.userId;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send(`No company with id: ${id}`);
    }

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

    if (!company) {
      return res.status(404).send(`No company with id: ${id}`);
    }

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
    res.status(404).json({ message: error.message });
  }
};

export const getCompanyProfile = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    const company = await Companies.findById({ _id: id });

    if (!company) {
      return res.status(200).send({
        message: "Company Not Found",
        success: false,
      });
    }
    company.password = undefined;
    return res.status(200).json({
      success: false,
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

//GET ALL COMPANIES

export const getCompanies = async (req, res, next) => {
  try {
    const { search, sort, location } = req.query;

    //conditions for searching filters

    const queryObject = {};

    if (search) {
      queryObject.name = { $regex: search, $options: "i" };
    }

    if (location) {
      queryObject.location = { $regex: location, $options: "i" };
    }

    let queryRusult = Companies.find(queryObject).select("-password");

    //SORTING

    if (sort === "Newest") {
      queryRusult = queryRusult.sort("-createdAt");
    }
    if (sort === "Oldest") {
      queryRusult = queryRusult.sort("createdAt");
    }

    if (sort === "A-Z") {
      queryRusult = queryRusult.sort("name");
    }
    if (sort === "Z-A") {
      queryRusult = queryRusult.sort("-name");
    }

    //PADDINARIONS

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    //record count
    const total = await Companies.countDocuments(queryRusult);
    const numOfPage = Math.ceil(total / limit);

    // queryRusult = queryRusult.skip(skip).limit(limit);

    queryRusult = queryRusult.limit(limit * page);
    const companies = await queryRusult;

    res.status(200).json({
      success: true,
      total,
      data: companies,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message,
    });
  }
};

//GET COMPANY JOBS

export const getCompanyJobListing = async (req, res, next) => {
  const { search, sort } = req.query;

  const id = req.body.user.userId;
  try {
    const queryObject = {};

    if (search) {
      queryObject.location = { $regex: search, $options: "i" };
    }
    let sorting;

    if (sort === "Newest") {
      sorting: "-createdAt";
    }
    if (sort === "Oldest") {
      sorting: "createdAt";
    }

    if (sort === "A-Z") {
      sorting: "name";
    }
    if (sort === "Z-A") {
      sorting: "-name";
    }

    let queryResult = await Companies.findById({ _id: id }).populate({
      path: "JobPosts",
      options: { sort: sorting },
    });

    const companies = queryRusult;
    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

//GET SINGLE COMPANY
export const getCompanyByID = async (req, res, next) => {
  try {
    const id = req.params.id; // Correctly accessing the id from req.params

    const company = await Companies.findById(id).populate({
      path: "jobPosts",
      options: {
        sort: "-_id",
      },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.password = undefined;

    res.status(200).json({
      success: true, // Assuming 'success' should be a boolean
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message }); // Changed to 500 for server errors
  }
};
