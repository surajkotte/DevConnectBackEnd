const express = require("express");
const ChatModel = require("../models/chat");
const messageRouter = express.Router();
const Connections = require("../models/connection");
const userAuth = require("../middlewares/auth");

messageRouter.get("/getMessages/:connectionId", userAuth, async (req, res) => {
  const { connectionId } = req.params;
  try {
    const con = await Connections.findById({ _id: connectionId });
    if (!con) {
      throw new Error("Invalid connection details");
    } else {
      const connectionDetails = await ChatModel.findOne(
        {
          connectionId: connectionId,
        },
        null,
        { sort: { timestamps: 1 } }
      );
      if (connectionDetails) {
        res.json({ messagetype: "S", data: connectionDetails });
      } else {
        res.json({ messagetype: "S", data: [] });
      }
    }
  } catch (err) {
    res.status(400).json({ messagetype: "E", message: err.message });
  }
});

messageRouter.post("/sendMessage/:connectionId", userAuth, async (req, res) => {
  const { from, to, message } = req.body;
  const { connectionId } = req.params;
  try {
    const connection = await Connections.findById({ _id: connectionId });
    if (!connection) {
      throw new Error("Invalid connection details");
    } else {
      const connectionDetails = await ChatModel.findOne(
        { connectionId },
        null,
        {
          sort: { timestamps: -1 },
        }
      );
      if (connectionDetails) {
        connectionDetails.messages?.push({
          from: from,
          to: to,
          message: message,
        });
        await connectionDetails.save();
        res.json({ messagetype: "S", data: connectionDetails });
      } else {
        const chat = new ChatModel({
          connectionId: connectionId,
          messages: [{ from: from, to: to, message: message }],
        });
        await chat.save();
        res.json({ messagetype: "S", data: chat });
      }
    }
  } catch (err) {
    res.status(400).json({ messagetype: "E", message: err.message });
  }
});

module.exports = messageRouter;
