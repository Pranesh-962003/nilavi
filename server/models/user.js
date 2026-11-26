import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      default: "",
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: false,
      select: false
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "STAFF", "CUSTOMER"],
      default: "CUSTOMER"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    lockUntil: {
      type: Date,
      select: false
    },
    lastLogin: {
      type: Date
    }
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export default UserModel;
