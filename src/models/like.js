const mongoose = require("mongoose");
const User = require("./user");
const userSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const likeSchema = mongoose.Schema(
  {
    feedId: {
      type: mongoose.Schema.ObjectId,
      require: true,
    },
    like: {
      type: [userSchema],
    },
    dislike: {
      type: [userSchema],
    },
    likeCount: Number,
    dislikeCount: Number,
  },
  { timestamps: true }
);

const LikeModal = new mongoose.model("likeModal", likeSchema);

module.exports = LikeModal;
