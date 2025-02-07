const express = require("express");
const app = express();
const { connectDB } = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
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
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", messageRouter);
// app.get("/user/", async (req, res) => {
//   const userId = req?.params?.userId;
//   const userEmail = req.body.emailId;
//   console.log(userEmail);
//   try {
//     const userData = await User.find({ emailId: userEmail });
//     if (userData.length <= 0) {
//       res.status(404).send("User not found");
//     } else {
//       res.send(userData);
//     }
//   } catch (err) {
//     res.status(400).send("User not found " + err.message);
//   }
// });
// app.delete("/user", async (req, res) => {
//   const userId = req.body.userId;
//   try {
//     const userData = await User.findByIdAndDelete(userId);
//     if (!userData) {
//       res.status(400).send("No user found to delete");
//     } else {
//       throw new Error("Password is invalid");
//     }
//   } catch (err) {
//     res.status(400).send("Error whicle deleting document " + err.message);
//   }
// });

// app.patch("/user", async (req, res) => {
//   const userId = req.body.userId;
//   const data = req.body;
//   const ALLOWED_UPDATES = [
//     "photoURL",
//     "firstName",
//     "lastName",
//     "age",
//     "about",
//     "skills",
//   ];
//   try {
//     const isUpdateAllowed = Object.keys(data).every((k) => {
//       ALLOWED_UPDATES.includes(keys);
//     });
//     if (!isUpdateAllowed) {
//       throw new Error("Update not allowed");
//     }
//     if (data?.skill?.length > 10) {
//       throw new Error("Skills should not be greater than 10");
//     }
//     const updatedInfo = await User.findByIdAndUpdate(userId, data, {
//       returnDocument: "after",
//       returnValidators: "true",
//     });
//     res.send("User updated successfully");
//   } catch (err) {
//     res.status(400).send("Error while updating data " + err.message);
//   }
// });

connectDB()
  .then(() => {
    console.log("Database connection successful");
    app.listen(3000, () => {
      console.log("Listening to server 3000");
    });
  })
  .catch(() => {
    console.log("Database connection failed");
  });
