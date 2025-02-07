const mongoose = require("mongoose");
const Connections = require("./connection");
const User = require("./user");

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "seen", "delivered"],
      default: "sent",
    },
  },
  { timestamps: true }
);

const chatSchema = mongoose.Schema(
  {
    connectionId: {
      type: mongoose.Schema.ObjectId,
      ref: Connections,
      required: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const ChatModel = mongoose.model("ChatModal", chatSchema);

module.exports = ChatModel;
