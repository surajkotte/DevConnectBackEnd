const mongoose = require("mongoose");
const User = require("./user");
const connectionSchema = mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    to: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: {
        values: ["accepted", "rejected", "interested", "ignored"],
        message: "{VALUE} is invalid",
      },
    },
  },
  { timestamps: true }
);

const Connections = mongoose.model("Connections", connectionSchema);

module.exports = Connections;
