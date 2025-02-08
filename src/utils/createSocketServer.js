const socket = require("socket.io");
const Connections = require("../models/connection");
const ChatModel = require("../models/chat");
const createSocketServer = (httpServer) => {
  const io = socket(httpServer, {
    cors: {
      origin: "http://localhost:1234",
      Credential: true,
    },
  });
  io.on("connection", (socket) => {
    socket.on("startConnection", ({ firstName, lastName, connectionId }) => {
      console.log(connectionId);
      socket.join(connectionId);
    });
    socket.on("sendMessage", async ({ from, to, message, connectionId }) => {
      let latestMessage = "";
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
            const updatedChat = await connectionDetails.save();
            latestMessage =
              updatedChat.messages[updatedChat.messages.length - 1];
          } else {
            const chat = new ChatModel({
              connectionId: connectionId,
              messages: [{ from: from, to: to, message: message }],
            });
            const savedChat = await chat.save();
            latestMessage = savedChat.messages[0];
          }
        }
      } catch (err) {
        console.log(err.message + " messagsave error");
        // res.status(400).json({ messagetype: "E", message: err.message });
      }
      console.log(latestMessage);
      io.to(connectionId).emit("messageReceived", { latestMessage });
    });
    socket.on("disconnect", () => {});
  });
};

module.exports = createSocketServer;
