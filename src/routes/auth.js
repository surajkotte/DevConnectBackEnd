const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const User = require("../models/user");
const validator = require("validator");
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req?.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Inavlid EmailID");
    }
    const userData = await User.findOne({ emailId: emailId });
    if (!userData) {
      throw new Error("Email or password is incorrect");
    }
    const isPasswordValid = await bcrypt.compare(password, userData?.password);
    if (isPasswordValid) {
      const token = await JWT.sign({ id: userData?._id }, "DEV@CONNECT@69", {
        expiresIn: "2h",
      });
      res.cookie("token", token);
      res.send({
        messageType: "S",
        data: {
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          gender: userData?.gender,
          photoURL: userData?.photoURL,
          age: userData?.age,
          skills:userData?.skills,
        },
      });
    } else {
      throw new Error("Email or password is incorrect");
    }
  } catch (err) {
    res.status(401).json({ messageType: "E", message: err.message });
  }
});

authRouter.post("/signup", async (req, res) => {
  const reqBody = req?.body;
  try {
    const { password } = req.body;
    console.log(password);
    const passwordHash = await bcrypt.hash(password, 10);
    // console.log(passwordHash);
    const emailId = req?.body?.emailId;
    const user = new User({ ...reqBody, password: passwordHash });
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Error saving data to database: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", "", { expires: new Date(Date.now() - 1) });
  res.json({ messageType: "S", message: "Logout successful" });
});

module.exports = authRouter;
