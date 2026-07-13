import { Router } from "express";
import Idea from "../ideas/idea.model.js";
import Vote from "../votes/vote.model.js";
import { computeScore } from "../ideas/score.js";

const router = Router();

router.get("/users/:id/ideas", async (req, res) => {
  try {
    const ideas = await Idea.find({ author: req.params.id })
      .populate("author", "name")
      .sort({ createdAt: -1 });

    const ideasWithScores = await Promise.all(
      ideas.map(async (idea) => {
        const votes = await Vote.find({ idea: idea._id });
        return {
          ...idea.toObject(),
          score: computeScore(votes),
        };
      })
    );

    res.json({ ideas: ideasWithScores, total: ideasWithScores.length });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

export default router;
