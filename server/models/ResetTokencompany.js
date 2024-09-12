import mongoose from "mongoose";

const resetTokenSchemaCompany = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Companies",
    required: true,
  },
});

const ResetTokenCompany = mongoose.model(
  "ResetTokenCompany",
  resetTokenSchemaCompany
);

export default ResetTokenCompany;
