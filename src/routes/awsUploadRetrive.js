const express = require("express");
const userAuth = require("../middlewares/auth");
const upload = require("../utils/uploadFielToAWS");
const feedModel = require("../models/feed");
const likeModal = require("../models/like");
const multer = require("multer");
const FeedRouter = express.Router();
const ALLOWED_DATA = "firstName lastName photoURL";
const upload1 = multer({ storage: multer.memoryStorage() });
FeedRouter.post(
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
        const responseData = await feed.save();
        response.data = responseData;
        res.json(response);
      }
    } catch (err) {
      res.status(400).json({ messageType: "E", message: err.message });
    }
  }
);

FeedRouter.get("/aws/getFeed", userAuth, async (req, res) => {
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

FeedRouter.post("/feed/:action/:feedId", userAuth, async (req, res) => {
  const { action, feedId } = req.params;
  const { userId, comments } = req.body;
  try {
    const data = await likeModal.findOne({ feedId: feedId });
    if (data && data.length != 0 && data != null) {
      if (action == "comment") {
        data.comments.push({
          comment: { commentText: comments, userId: userId },
          reply: [],
        });
        data.commentCount += 1;
        const response = await data.save();
        res.json({ messageType: "S", data: response.commentCount });
      } else {
        const userExistInLike = data["like"].find(
          (info) => info.userId == userId
        );
        const userExistInDisLike = data["dislike"].find(
          (info) => info.userId == userId
        );
        let newLikeData = [];
        let newDisLikeData = [];
        if (userExistInLike || userExistInDisLike) {
          newLikeData = data["like"]?.filter((userInfo) => {
            return userInfo?.userId.toString() != userId.toString();
          });
          data["like"] = newLikeData;
          data.likeCount = newLikeData.length;
        }
        if (userExistInDisLike) {
          newDisLikeData = data["dislike"]?.filter((userInfo) => {
            return userInfo?.userId.toString() != userId.toString();
          });
          data["dislike"] = newDisLikeData;
          data.dislikeCount = newDisLikeData.length;
        }
        if (
          (userExistInLike && action == "dislike") ||
          (userExistInDisLike && action == "like") ||
          (!userExistInDisLike && !userExistInLike)
        ) {
          data[`${action}`].push({ userId });
          data.likeCount =
            action == "like" ? data.likeCount + 1 : data.likeCount;
          data.dislikeCount =
            action == "dislike" ? data.dislikeCount + 1 : data.dislikeCount;
        }
        const response = await data.save();
        res.json({
          messageType: "S",
          data: {
            likeCount: response.likeCount,
            dislikeCount: response.dislikeCount,
          },
        });
      }
    } else {
      console.log("here");
      console.log(comments);
      const likeData = new likeModal({
        feedId: feedId,
        like: action === "like" ? [{ userId }] : [],
        dislike: action === "dislike" ? [{ userId }] : [],
        likeCount: action === "like" ? 1 : 0,
        dislikeCount: action === "dislike" ? 1 : 0,
        comments:
          action === "comment" && comments
            ? [
                {
                  comment: { commentText: comments, userId: userId },
                  reply: [],
                },
              ]
            : [],
        commentCount: action === "comment" && comments ? 1 : 0,
      });
      const response = await likeData.save();
      res.json({
        messageType: "S",
        data: {
          likeCount: response.likeCount,
          dislikeCount: response.dislikeCount,
          commentsCount: response.commentCount,
        },
      });
    }
    // if (action == "like") {
    //   if (data && data.length != 0) {
    //     data.like.push(userId);
    //     data.likeCount += 1;
    //     const response = await data.save();
    //     res.json({ messageType: "S", data: response.likeCount });
    //   } else {
    //     const likeData = new likeModal({
    //       feedId: feedId,
    //       like: [{ userId }],
    //       dislike: [],
    //       dislikeCount: 0,
    //       likeCount: 1,
    //     });
    //     const response = await likeData.save();
    //     res.json({ messageType: "S", data: response.likeCount });
    //   }
    // } else if (action == "dislike") {
    //   if (data && data.length != 0) {
    //     data.dislike.push(userId);
    //     data.dislikeCount += 1;
    //     const response = await data.save();
    //     res.json({ messageType: "S", data: response.dislikeCount });
    //   } else {
    //     const likeData = new likeModal({
    //       feedId: feedId,
    //       dislike: [{ userId }],
    //       dislikeCount: 1,
    //       like: [],
    //       likeCount: 0,
    //     });
    //     const response = await likeData.save();
    //     res.json({ messageType: "S", data: response.dislikeCount });
    //   }
    // }
  } catch (err) {
    res.status(400).json({ messageType: "E", message: err.message });
  }
});

FeedRouter.get("/feed/countInfo/:feedId", userAuth, async (req, res) => {
  const { feedId } = req.params;
  try {
    const data = await likeModal
      .findOne({ feedId: feedId })
      .populate("comments.comment.userId", ALLOWED_DATA)
      .populate("comments.reply.userId", ALLOWED_DATA)
      .populate("like.userId", ALLOWED_DATA)
      .populate("dislike.userId", ALLOWED_DATA);
    res.json({ messageType: "S", data: data });
  } catch (err) {
    res.status(400).json({ messageType: "E", message: err.message });
  }
});

module.exports = FeedRouter;

// comments: [
//   {
//     comment: [{ commentText: comments, userId: userId }],
//     reply: [{ commentText: "", userId: "" }],
//   },
// ];
