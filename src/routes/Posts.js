const express = require("express");
const PostModal = require("../models/Post");
const Notification = require("../models/Notification");
const PostRouter = express.Router();

const ALLOWED_DATA = "firstName lastName photoURL";
PostRouter.post("/post/send/:postId", async (req, res) => {
  const { postId } = req.params;
  const { from, to } = req.body;
  try {
    const toData = to.map((t) => {
      return { to: t };
    });
    // toData.forEach((element) => async () => {
    //   const notificationData = await Notification.findOne({ to: element.to });
    //   if (notificationData) {
    //     notificationData.notifications.push({ from: from, postId: postId });
    //     notificationData.notificationCount += 1;
    //     const data = await notificationData.save();
    //   } else {
    //     const notification = new Notification({
    //       to: element.to,
    //       notifications: [{ from: from, postId: postId }],
    //     });
    //     const data = await notification.save();
    //   }
    // });
    //   res.json({ messageType: "S", message: "Notification sent successfully" });
    const postData = await PostModal.findOne({ post: postId, from: from });
    if (postData) {
      postData.toUsers.push(...toData);
      const data = await postData.save();
      res.json({ messageType: "S", data: data });
    } else {
      const postModal = new PostModal({ from, toUsers: toData, post: postId });
      const data = await postModal.save();
      res.json({ messageType: "S", data: data });
    }
  } catch (err) {
    res.status(400).json({ messageType: "E", message: err.message });
  }
});

PostRouter.post("/post/send/notification/:postId", async (req, res) => {
  const { postId } = req.params;
  const { from, to, actionType } = req.body;
  console.log(from + " " + actionType);

  try {
    const notificationPromises = to.map(async (receiver) => {
      const notificationData = await Notification.findOne({ to: receiver });
      if (notificationData) {
        notificationData.notifications.push({
          from: from,
          post: postId,
          actionType: actionType,
        });
        notificationData.notificationCount += 1;
        return notificationData.save();
      } else {
        const newNotification = new Notification({
          to: receiver,
          notifications: [{ from: from, post: postId, actionType: actionType }],
          notificationCount: 1,
        });
        return newNotification.save();
      }
    });
    const responseData = await Promise.all(notificationPromises);
    console.log(responseData);
    if (responseData) {
      res.json({ messageType: "S", message: "Notification sent successfully" });
    }
  } catch (err) {
    res.status(400).json({ messageType: "E", message: err.message });
  }
});

PostRouter.get("/post/get/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const notificationData = await Notification.findOne({
      to: userId,
    }).populate("notifications.from", ALLOWED_DATA);
    if (notificationData?.length != 0) {
      res.json({ messageType: "S", data: notificationData });
    } else {
      res.json({ messageType: "S", data: [] });
    }
  } catch (err) {
    res.status(400).json({ messageType: "E", message: err.message });
  }
});

module.exports = PostRouter;
