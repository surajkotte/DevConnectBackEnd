const express = require("express");
const User = require("../models/user");
const Connections = require("../models/connection");
const userAuth = require("../middlewares/auth");
const { set } = require("mongoose");
const userRouter = express.Router();
const ALLOWED_DATA = "firstName lastName age gender photoURL about skills";

userRouter.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await Connections.find({
      to: loggedInUser?._id,
      status: "interested",
    }).populate("from", ALLOWED_DATA);
    console.log(connectionRequests);
    if (!connectionRequests) {
      throw new Error("No connection requests found");
    }
    res.json({ messageType: "S", data: connectionRequests });
  } catch (err) {
    res.status(400).json({ messageType: "E", message: err.message });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await Connections.find({
      $or: [
        { from: loggedInUser._id, status: "accepted" },
        { to: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("to", ALLOWED_DATA)
      .populate("from", ALLOWED_DATA);
    if (!connections) {
      throw new Error("No connections found");
    }
    const allConnections = connections.map((data) => {
      if (data?.from?._id.toString() === loggedInUser._id.toString()) {
        return data?.to;
      } else if (data?.to?._id.toString() === loggedInUser._id.toString()) {
        return data?.from;
      }
    });
    res.json({ messageType: "S", data: allConnections });
  } catch (err) {
    res.status(400).json({ messageType: "E", message: err.message });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await Connections.find({
      $or: [{ from: loggedInUser._id }, { to: loggedInUser?._id }],
    }).select("from to");
    let uniqueConnections = new Set();
    //console.log(connections);
    if (connections.length != 0) {
      connections.map((connectionInfo) => {
        uniqueConnections.add(connectionInfo?.from.toString());
        uniqueConnections.add(connectionInfo?.to.toString());
      });
    }
    let connections1 = [...uniqueConnections];
    const remainingConnections = await User.find({
      $and: [
        { _id: { $nin: Array.from(connections1) } },
        { _id: { $ne: loggedInUser?._id } },
      ],
    }).select(ALLOWED_DATA);
    res.json({ messageType: "S", data: remainingConnections });
  } catch (err) {
    res.status(400).json({ messageType: "E", message: err.message });
  }
});
module.exports = userRouter;
