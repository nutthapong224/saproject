import Users from "../models/userModel.js";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password,contact } = req.body;

  //validate fileds

  if (!firstName) {
    next("First Name is required");
  }
  if (!email) {
    next("Email is required");
  }
  if (!lastName) {
    next("Last Name is required");
  }
  if (!password) {
    next("Password is required");
  }

  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      next("Email Address already exists");
      return;
    }

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password,
    });

    // user token
    const token = await user.createJWT();

    res.status(201).send({
      success: true,
      message: "Account created successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email, 
      
        accountType: user.accountType,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};


export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return next(new Error("Please provide user credentials"));
    }

    // Fetch the user including the necessary fields
    const user = await Users.findOne({ email }).select(
      "+password +firstName +lastName +email +accountType"
    );

    if (!user) {
      return next(new Error("Invalid email or password"));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new Error("Invalid password"));
    }

    // Generate JWT token
    const token = user.createJWT();

    res.status(200).json({
      success: true,
      message: "Login successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contact: user.contact, 
        about:user.about, 
        location:user.location,
        profileUrl:user.profileUrl, 
        jobTitle:user.jobTitle,
        accountType: user.accountType, // Include accountType
      },
      token,
    });
  } catch (error) {
    console.log(error);
    next(error); // Use `next` to handle errors
  }
};