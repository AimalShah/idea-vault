import { Router } from "express";
import Vote from "./vote.model.js";
import Idea from "../ideas/idea.model.js";
import { computeScore } from "../ideas/score.js";
import auth from "../auth/auth.middleware.js";

const router = Router();

router.post("/:id/votes", auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: { message: "Idea not found" } });
    }

    if (idea.status !== "open") {
      return res.status(403).json({ error: { message: "Cannot vote on a closed idea" } });
    }

    if (idea.author.toString() === req.userId) {
      return res.status(403).json({ error: { message: "Cannot vote on your own idea" } });
    }

    const { value } = req.body;
    if (!value || !["good", "bad"].includes(value)) {
      return res.status(400).json({ error: { message: "Vote value must be 'good' or 'bad'" } });
    }

    const vote = await Vote.findOneAndUpdate(
      { idea: req.params.id, user: req.userId },
      { value },
      { upsert: true, new: true }
    );

    const votes = await Vote.find({ idea: req.params.id });
    res.json({ score: computeScore(votes) });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.get("/:id/votes/me", auth, async (req, res) => {
  try {
    const vote = await Vote.findOne({ idea: req.params.id, user: req.userId });
    res.json({ vote });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.delete("/:id/votes", auth, async (req, res) => {
  try {
    await Vote.findOneAndDelete({ idea: req.params.id, user: req.userId });

    const votes = await Vote.find({ idea: req.params.id });
    res.json({ score: computeScore(votes) });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

export default router;
