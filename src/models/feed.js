const mongoose = require("mongoose");
const User = require("./user");
const feedContentSchema = mongoose.Schema(
  {
    contentURL: { type: String },
    contentText: { type: String },
  },
  { timestamps: true }
);
const feedSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: true,
    },
    feedContent: { type: feedContentSchema },
  },
  { timestamps: true }
);

const FeedModel = mongoose.model("FeedModel", feedSchema);

module.exports = FeedModel;
