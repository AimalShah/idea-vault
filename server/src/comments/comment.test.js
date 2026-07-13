import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import mongoose from "mongoose";

process.env.JWT_SECRET = "test-secret";

import app from "../app.js";
import User from "../auth/user.model.js";
import Idea from "../ideas/idea.model.js";
import Comment from "./comment.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/idea-vault-test";
let token;
let otherToken;
let ideaId;

before(async () => {
  await mongoose.connect(MONGO_URI);
  await Idea.deleteMany({});
  await Comment.deleteMany({});

  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Commenter", email: "commenter@test.com", password: "password123" });
  token = res.body.token;

  const otherRes = await request(app)
    .post("/api/auth/register")
    .send({ name: "Idea Owner", email: "owner@test.com", password: "password123" });
  otherToken = otherRes.body.token;

  const ideaRes = await request(app)
    .post("/api/ideas")
    .set("Cookie", `token=${otherToken}`)
    .send({ title: "Comment Test", description: "An idea for comments" });
  ideaId = ideaRes.body.idea._id;
});

after(async () => {
  await Idea.deleteMany({});
  await Comment.deleteMany({});
  await mongoose.connection.close();
});

describe("POST /api/ideas/:id/comments", () => {
  it("creates a comment when authenticated", async () => {
    const res = await request(app)
      .post(`/api/ideas/${ideaId}/comments`)
      .set("Cookie", `token=${token}`)
      .send({ text: "Great idea!" });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.comment.text, "Great idea!");
    assert.strictEqual(res.body.comment.author.name, "Commenter");
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app)
      .post(`/api/ideas/${ideaId}/comments`)
      .send({ text: "Test" });

    assert.strictEqual(res.status, 401);
  });

  it("rejects empty text", async () => {
    const res = await request(app)
      .post(`/api/ideas/${ideaId}/comments`)
      .set("Cookie", `token=${token}`)
      .send({ text: "" });

    assert.strictEqual(res.status, 400);
  });
});

describe("GET /api/ideas/:id/comments", () => {
  it("lists comments for an idea", async () => {
    const res = await request(app).get(`/api/ideas/${ideaId}/comments`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.comments));
    assert.ok(res.body.comments.length > 0);
  });
});

describe("PATCH /api/ideas/:ideaId/comments/:commentId", () => {
  it("allows author to edit comment", async () => {
    const listRes = await request(app).get(`/api/ideas/${ideaId}/comments`);
    const commentId = listRes.body.comments[0]._id;

    const res = await request(app)
      .patch(`/api/ideas/${ideaId}/comments/${commentId}`)
      .set("Cookie", `token=${token}`)
      .send({ text: "Updated comment" });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.comment.text, "Updated comment");
  });

  it("rejects edit from non-author", async () => {
    const listRes = await request(app).get(`/api/ideas/${ideaId}/comments`);
    const commentId = listRes.body.comments[0]._id;

    const res = await request(app)
      .patch(`/api/ideas/${ideaId}/comments/${commentId}`)
      .set("Cookie", `token=${otherToken}`)
      .send({ text: "Hacked!" });

    assert.strictEqual(res.status, 403);
  });
});
