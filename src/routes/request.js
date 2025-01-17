const express = require("express");
const userAuth = require("../middlewares/auth");
const Connections = require("../models/connection");
//const { Form } = require("react-router-dom");
const requestRoute = express.Router();

requestRoute.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res) => {
    try {
      const { status, userId } = req.params;
      console.log(userId);
      if (req.user?._id === userId) {
        throw new Error("Cannot send data to same user");
      }
      const connection = new Connections({
        from: req?.user?._id,
        to: userId,
        status: status,
      });
      const ALLOWED_STATUS = ["interested", "rejected"];
      if (!ALLOWED_STATUS.includes(status)) {
        throw new Error("Invalid status");
      }
      const connectionExist = await Connections.findOne({
        $or: [
          { from: req?.user?._id, to: userId },
          {
            from: userId,
            to: req?.user?._id,
          },
        ],
      });
      if (connectionExist) {
        throw new Error("Connection already exist");
      }
      await connection.save();
      res.json({
        messageType: "s",
        connection,
      });
    } catch (err) {
      res.status(400).json({
        messageType: "E",
        message: err.message,
      });
    }
  }
);

requestRoute.post(
  "/request/review/:status/:userId",
  userAuth,
  async (req, res) => {
    const { status, userId } = req.params;
    try {
      const ALLOWED_STATUS = ["accepted", "rejected"];
      if (!ALLOWED_STATUS.includes(status)) {
        throw new Error("Invalid status");
      }
      const user = req.user;
      const connectionRequest = await Connections.findById(userId);
      if (!connectionRequest) {
        throw new Error("Invalid connection request");
      }
      console.log(connectionRequest);
      //const connection = new Connections({ connectionRequest, status: status });
      connectionRequest.status = status;
      await connectionRequest.save();
      res.send({ messageType: "S", message: connectionRequest });
    } catch (err) {
      res.status(400).json({ messageType: "E", message: err.message });
    }
  }
);

module.exports = requestRoute;
