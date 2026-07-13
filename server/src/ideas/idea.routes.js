import { Router } from "express";
import Idea from "./idea.model.js";
import Vote from "../votes/vote.model.js";
import auth from "../auth/auth.middleware.js";
import { computeScore } from "./score.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { sort = "newest", status = "all", search } = req.query;
    const filter = {};
    if (status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortObj = sort === "popular" ? { createdAt: -1 } : { createdAt: -1 };
    const ideas = await Idea.find(filter)
      .populate("author", "name")
      .sort(sortObj);

    const ideasWithScores = await Promise.all(
      ideas.map(async (idea) => {
        const votes = await Vote.find({ idea: idea._id });
        return {
          ...idea.toObject(),
          score: computeScore(votes),
        };
      })
    );

    if (sort === "popular") {
      ideasWithScores.sort((a, b) => b.score.good - a.score.good);
    }

    res.json({ ideas: ideasWithScores, total: ideasWithScores.length });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).populate("author", "name");
    if (!idea) {
      return res.status(404).json({ error: { message: "Idea not found" } });
    }

    const votes = await Vote.find({ idea: idea._id });
    res.json({ idea: { ...idea.toObject(), score: computeScore(votes) } });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: { message: "Title and description are required" } });
    }

    const idea = await Idea.create({
      title,
      description,
      author: req.userId,
    });

    res.status(201).json({ idea });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: { message: "Idea not found" } });
    }

    if (idea.author.toString() !== req.userId) {
      return res.status(403).json({ error: { message: "Only the author can update this idea" } });
    }

    const { status } = req.body;
    if (status) idea.status = status;
    await idea.save();

    res.json({ idea });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

export default router;
