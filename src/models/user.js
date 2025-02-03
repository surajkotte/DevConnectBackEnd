const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid EmailId");
        }
      },
    },
    password: {
      type: String,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Please enter valid Gender");
        }
      },
    },
    photoURL: {
      type: String,
      default:
        "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL");
        }
      },
    },
    about: {
      type: String,
    },
    skills: {
      type: [String],
    },
    company: {
      type: String,
    },
    designation: {
      type: String,
    },
    education: {
      type: [
        {
          institution: { type: String },
          degree: { type: String },
          fieldOfStudy: { type: String },
          startDate: { type: Date },
          endDate: { type: Date },
        },
      ],
    },
    experiance: {
      type: [
        {
          company: { type: String },
          designation: { type: String },
          startDate: { type: Date },
          endDate: { type: Date },
          description: { type: String },
        },
      ],
    },
    gitHubURL: {
      type: String,
    },
    instagramURL: {
      type: String,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", function (next) {
  if (this.experience && this.experience.length > 1) {
    this.experience.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
