import { Router } from "express";
import Comment from "./comment.model.js";
import auth from "../auth/auth.middleware.js";

const router = Router();

router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ idea: req.params.id })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: { message: "Comment text is required" } });
    }

    const comment = await Comment.create({
      text,
      idea: req.params.id,
      author: req.userId,
    });

    const populated = await comment.populate("author", "name");
    res.status(201).json({ comment: populated });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.patch("/:ideaId/comments/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: { message: "Comment not found" } });
    }

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ error: { message: "Only the author can edit this comment" } });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: { message: "Comment text is required" } });
    }

    comment.text = text;
    await comment.save();

    const populated = await comment.populate("author", "name");
    res.json({ comment: populated });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.delete("/:ideaId/comments/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: { message: "Comment not found" } });
    }

    const Idea = (await import("../ideas/idea.model.js")).default;
    const idea = await Idea.findById(req.params.ideaId);
    if (!idea) {
      return res.status(404).json({ error: { message: "Idea not found" } });
    }

    if (idea.author.toString() !== req.userId) {
      return res.status(403).json({ error: { message: "Only the idea author can delete comments" } });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

export default router;
