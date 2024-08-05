import Users from "../models/userModel.js";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password, contact } = req.body;


  if (!firstName)
    return res
      .status(400)
      .json({ success: false, message: "First Name is required" });
  if (!lastName)
    return res
      .status(400)
      .json({ success: false, message: "Last Name is required" });
  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  if (!password)
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });

  try {
    const userExist = await Users.findOne({ email });

  if (userExist) {
    return res
      .status(400)
      .json({ success: false, message: "Email Address already exists" });
  }


    const user = await Users.create({
      firstName,
      lastName,
      email,
      password,
    });

    // User token
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
    res
      .status(500)
      .json({
        success: false,
        message: "Server error. Please try again later.",
      });
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
      "+password"
    );

    if (!user) {
      return next("Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next("Invalid password");
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