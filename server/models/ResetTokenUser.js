import mongoose from "mongoose";

const resetTokenSchemaUser = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const ResetTokenUser = mongoose.model("ResetTokenUser", resetTokenSchemaUser);

export default ResetTokenUser;
