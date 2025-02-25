const express = require("express");
const userAuth = require("../middlewares/auth");
const upload = require("../utils/uploadFielToAWS");
const feedModel = require("../models/feed");
const likeModal = require("../models/like");
const multer = require("multer");
const awsRouter = express.Router();
const ALLOWED_DATA = "firstName lastName photoURL";
const upload1 = multer({ storage: multer.memoryStorage() });

awsRouter.post(
  "/aws/upload",
  userAuth,
  upload1.single("file"),
  async (req, res) => {
    const textContent = req.body.details;
    const userId = req.body.userId;
    if (!req.file)
      return res
        .status(400)
        .json({ messageType: "E", message: "No file uploaded" });
    const file = {
      body: req.file.buffer,
      name: req.file.originalname,
      type: req.file.mimetype,
    };
    try {
      const response = await upload(file);
      if (response.messageType == "S") {
        const decodedURL = decodeURIComponent(response?.data?.Location);
        const feed = new feedModel({
          userId: userId,
          feedContent: {
            contentURL: decodedURL,
            contentText: textContent,
          },
        });
        await feed.save();
        res.json(response);
      }
    } catch (err) {
      res.status(400).json({ messageType: "E", message: err.message });
    }
  }
);

awsRouter.get("/aws/getFeed", userAuth, async (req, res) => {
  try {
    const data = await feedModel.find().populate("userId", ALLOWED_DATA);
    if (data.length == 0) {
      res.json({ messageType: "S", data: [] });
    } else {
      res.json({ messageType: "S", data: data });
    }
  } catch (err) {
    res.status(400).json({ messageType: "E", message: "data fetch failed" });
  }
});

awsRouter.post("/feed/:action/:feedId", userAuth, async (req, res) => {
  const { action, feedId } = req.params;
  const { userId } = req.body;
  try {
    const data = await likeModal.findOne({ feedId: feedId });
    console.log(data);
    console.log(data);
    if (action == "like") {
      if (data && data.length != 0) {
        data.like.push(userId);
        data.likeCount += 1;
        const response = await data.save();
        res.json({ messageType: "S", data: response.likeCount });
      } else {
        const likeData = new likeModal({
          feedId: feedId,
          like: [{ userId }],
          dislike: [],
          dislikeCount: 0,
          likeCount: 1,
        });
        const response = await likeData.save();
        res.json({ messageType: "S", data: response.likeCount });
      }
    } else if (action == "dislike") {
      if (data && data.length != 0) {
        data.dislike.push(userId);
        data.dislikeCount += 1;
        const response = await data.save();
        res.json({ messageType: "S", data: response.dislikeCount });
      } else {
        const likeData = new likeModal({
          feedId: feedId,
          dislike: [{ userId }],
          dislikeCount: 1,
          like: [],
          likeCount: 0,
        });
        const response = await likeData.save();
        res.json({ messageType: "S", data: response.dislikeCount });
      }
    }
  } catch (err) {
    res.status(400).json({ messageType: "E", message: err.message });
  }
});

module.exports = awsRouter;
