const express = require("express");
const http = require("http");
const createSocketServer = require("./utils/createSocketServer");
const app = express();
const { connectDB } = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:1234",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const messageRouter = require("./routes/message");
const FeedRouter = require("./routes/awsUploadRetrive");
const PostRouter = require("./routes/Posts");
const server = http.createServer(app);
createSocketServer(server);
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", messageRouter);
app.use("/", FeedRouter);
app.use("/", PostRouter);
connectDB()
  .then(() => {
    console.log("Database connection successful");
    server.listen(process.env.port, () => {
      console.log("Listening to server 3000");
    });
  })
  .catch(() => {
    console.log("Database connection failed");
  });
