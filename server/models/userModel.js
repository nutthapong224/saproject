  import mongoose from "mongoose";
  import validator from "validator";
  import bcrypt from "bcryptjs";
  import JWT from "jsonwebtoken";

  const userSchema = new mongoose.Schema(
    {
      firstName: {
        type: String,
        required: [true, "First Name is required"],
      },
      lastName: {
        type: String,
        required: [true, "Last Name is required"],
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email"],
      },
      password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: true,
      },
      accountType: { type: String, default: "seeker" },
      contact: { type: String },
      location: { type: String },
      profileUrl: { type: String },
      jobTitle: { type: String },
      about: { type: String },
    },
    {
      timestamps: true,
    }
  );

  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
  };

  userSchema.methods.createJWT = function () {
    return JWT.sign({ userId: this._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
  };

  const Users = mongoose.model("Users", userSchema);

  export default Users;
