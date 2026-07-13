import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./src/auth/user.model.js";
import Idea from "./src/ideas/idea.model.js";
import Vote from "./src/votes/vote.model.js";
import Comment from "./src/comments/comment.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/idea-vault";

const users = [
  { name: "Alice Chen", email: "alice@example.com", password: "password123" },
  { name: "Bob Kumar", email: "bob@example.com", password: "password123" },
  { name: "Carol Davis", email: "carol@example.com", password: "password123" },
];

const ideas = [
  { title: "AI-powered code reviewer", description: "A tool that uses LLMs to review pull requests and suggest improvements based on best practices and team conventions.", status: "open" },
  { title: "Community-driven bug bounty", description: "Platform where companies can post bugs and developers earn rewards for fixing them. Think open-source meets bug bounty.", status: "open" },
  { title: "Smart meeting summarizer", description: "Records meetings, transcribes them, and generates actionable summaries with assigned tasks and deadlines.", status: "open" },
  { title: "Decentralized identity wallet", description: "A self-sovereign identity app where users control their credentials without relying on centralized providers.", status: "closed" },
  { title: "Real-time collaborative whiteboard", description: "Like Miro but open-source, with built-in voting on ideas and real-time conflict resolution.", status: "open" },
  { title: "Climate action tracker", description: "Personal carbon footprint tracker that connects to your bank accounts and suggests eco-friendly alternatives.", status: "open" },
  { title: "Micro-learning platform", description: "Break down any topic into 5-minute lessons with spaced repetition and progress tracking.", status: "closed" },
  { title: "Open-source design system", description: "A community-maintained component library with accessibility baked in and automatic documentation.", status: "open" },
  { title: "Skill-based mentoring network", description: "Connect mentors and mentees based on specific skills needed, not just industry. AI-matched for compatibility.", status: "open" },
  { title: "Local events aggregator", description: "Aggregates events from multiple sources (Meetup, Eventbrite, local listings) into one personalized feed.", status: "open" },
];

const comments = [
  "This is a fantastic idea! I've been looking for something like this.",
  "How would you handle privacy concerns with this approach?",
  "I think there's a real market for this. Would definitely use it.",
  "Have you considered integrating with existing tools?",
  "The UX could make or break this. Focus on simplicity.",
  "I've built something similar - happy to share my learnings.",
  "This could save our team hours every week.",
  "What's the monetization strategy?",
  "Love the open-source angle. Community contributions would accelerate this.",
  "Are there any regulatory hurdles to consider?",
  "This addresses a real pain point I deal with daily.",
  "Could this be extended to support enterprise use cases?",
  "The technical challenges here are fascinating.",
  "Would there be an API for third-party integrations?",
  "This is exactly what the market needs right now.",
];

const votes = ["good", "good", "good", "good", "good", "good", "good", "bad", "bad", "good"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    await Idea.deleteMany({});
    await Vote.deleteMany({});
    await Comment.deleteMany({});
    console.log("Cleared existing data");

    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    const createdIdeas = [];
    for (let i = 0; i < ideas.length; i++) {
      const author = createdUsers[i % createdUsers.length];
      const idea = await Idea.create({ ...ideas[i], author: author._id });
      createdIdeas.push(idea);
    }
    console.log(`Created ${createdIdeas.length} ideas`);

    let voteCount = 0;
    for (const idea of createdIdeas) {
      const voters = createdUsers.filter((u) => u._id.toString() !== idea.author.toString());
      for (const voter of voters) {
        if (Math.random() > 0.3) {
          await Vote.create({ idea: idea._id, user: voter._id, value: pick(votes) });
          voteCount++;
        }
      }
    }
    console.log(`Created ${voteCount} votes`);

    let commentCount = 0;
    for (const idea of createdIdeas) {
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numComments; i++) {
        const author = pick(createdUsers);
        await Comment.create({
          text: pick(comments),
          idea: idea._id,
          author: author._id,
        });
        commentCount++;
      }
    }
    console.log(`Created ${commentCount} comments`);

    console.log("\nSeed complete!");
    console.log("Login credentials:");
    createdUsers.forEach((u) => console.log(`  ${u.email} / password123`));
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
