const express = require("express");
const PostModal = require("../models/Post");
const PostRouter = express.Router();

PostRouter.post("/post/send/:postId", async (req, res) => {
  const { postId } = req.params;
  const { from, to } = req.body;
  try {
    const toData = to.map((t) => {
      return { to: t };
    });
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

module.exports = PostRouter;
