const mongoose = require("mongoose");
const FeedModel = require("./feed");
const User = require("./user");
const NotificationStructSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeedModel",
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  actionType: {
    type: String,
    required: true,
    Enumerator: [
      "post",
      "message",
      "request",
      "like",
      "comment",
      "reply",
      "follow",
    ],
  },
});

const NotificationSchema = new mongoose.Schema(
  {
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notifications: [NotificationStructSchema],
    notificationCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
