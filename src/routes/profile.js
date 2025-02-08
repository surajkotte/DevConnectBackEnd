const express = require("express");
const profileRouter = express.Router();
const useAuth = require("../middlewares/auth");
const validateEditProfile = require("../utils/validateProfileEdit");
const User = require("../models/user");
const fetchUserId = require("../utils/fetchUserId");
const bcrypt = require("bcrypt");
profileRouter.get("/profile/view", useAuth, async (req, res) => {
  try {
    // const cookies = req.headers.cookie;
    // const isValidToken = await JWT.verify(
    //   cookies.substring(6),
    //   "DEV@CONNECT@69"
    // );
    // if (!isValidToken) {
    //   throw new Error("Invalid Token");
    // }
    // const userData = await User.findById(isValidToken?.id);
    // console.log(userData);
    const userInfo = req.user;
    if (!userInfo) {
      throw new Error("User doesnot exist");
    }

    res.json({ messageType: "S", data: userInfo });
  } catch (err) {
    res.status(400).json({ messageType: "E", message: err.message });
  }
});

profileRouter.post("/profile/edit", useAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      throw new Error("Fields cannot be edited");
    }
    let user = req.user;
    const data = req.body;
    Object.keys(data).forEach((ele) => {
      user[ele] = data[ele];
    });
    const ID = await fetchUserId(req);
    const updatedInfo = await User.findByIdAndUpdate(ID, user, {
      returnDocument: "after",
      returnValidators: "true",
    });
    res.json({ messageType: "S", message: "User updated" });
  } catch (err) {
    res.status(400).json({ messageType: "S", message: err.message });
  }
});

profileRouter.post("/profile/password", useAuth, async (req, res) => {
  try {
    const user = req.user;
    const oldPassword = req.user["password"];
    const decodedPassword = await bcrypt.compare(
      oldPassword,
      req?.body?.currentPassword
    );
    if (!decodedPassword) {
      throw new Error("Old password is incorrect");
    }
    const newPassword = req.body.newPassword;
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user["password"] = newPasswordHash;
    await user.save();
    res.json({ messageType: "S", message: "Password Updated Successfully" });
  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});

module.exports = profileRouter;
