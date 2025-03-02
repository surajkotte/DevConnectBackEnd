const mongoose = require("mongoose");
const User = require("./user");
const { use } = require("react");
const userSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const commentSchema = mongoose.Schema(
  {
    commentText: { type: String },
    userId: { type: mongoose.Schema.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const feedCommentSchema = mongoose.Schema(
  {
    comment: commentSchema,
    reply: [commentSchema],
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
    comments: [feedCommentSchema],
    likeCount: Number,
    dislikeCount: Number,
    commentCount: Number,
  },
  { timestamps: true }
);

const LikeModal = new mongoose.model("likeModal", likeSchema);

module.exports = LikeModal;
