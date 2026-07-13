import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  idea: { type: mongoose.Schema.Types.ObjectId, ref: "Idea", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  value: { type: String, enum: ["good", "bad"], required: true },
});

voteSchema.index({ idea: 1, user: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
