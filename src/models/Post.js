const mongoose = require("mongoose");
const User = require("./user");
const feedModel = require("./feed");
const ToSchema = new mongoose.Schema(
  {
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const PostSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUsers: [ToSchema],
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feedModel",
      required: true,
    },
  },
  { timestamps: true }
);
const PostModal = mongoose.model("PostModal", PostSchema);

module.exports = PostModal;
