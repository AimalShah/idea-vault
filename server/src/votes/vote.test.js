import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import mongoose from "mongoose";

process.env.JWT_SECRET = "test-secret";

import app from "../app.js";
import User from "../auth/user.model.js";
import Idea from "../ideas/idea.model.js";
import Vote from "./vote.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/idea-vault-test";
let token;
let otherToken;
let ideaId;

before(async () => {
  await mongoose.connect(MONGO_URI);
  await Idea.deleteMany({});
  await Vote.deleteMany({});

  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Voter", email: "voter@test.com", password: "password123" });
  token = res.body.token;

  const otherRes = await request(app)
    .post("/api/auth/register")
    .send({ name: "Author", email: "author@test.com", password: "password123" });
  otherToken = otherRes.body.token;

  const ideaRes = await request(app)
    .post("/api/ideas")
    .set("Cookie", `token=${otherToken}`)
    .send({ title: "Vote Test", description: "An idea to vote on" });
  ideaId = ideaRes.body.idea._id;
});

after(async () => {
  await Idea.deleteMany({});
  await Vote.deleteMany({});
  await mongoose.connection.close();
});

describe("POST /api/ideas/:id/votes", () => {
  it("casts a good vote", async () => {
    const res = await request(app)
      .post(`/api/ideas/${ideaId}/votes`)
      .set("Cookie", `token=${token}`)
      .send({ value: "good" });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.score.good, 1);
  });

  it("changes vote from good to bad", async () => {
    const res = await request(app)
      .post(`/api/ideas/${ideaId}/votes`)
      .set("Cookie", `token=${token}`)
      .send({ value: "bad" });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.score.good, 0);
    assert.strictEqual(res.body.score.bad, 1);
  });

  it("rejects self-voting", async () => {
    const res = await request(app)
      .post(`/api/ideas/${ideaId}/votes`)
      .set("Cookie", `token=${otherToken}`)
      .send({ value: "good" });

    assert.strictEqual(res.status, 403);
  });

  it("rejects invalid vote value", async () => {
    const res = await request(app)
      .post(`/api/ideas/${ideaId}/votes`)
      .set("Cookie", `token=${token}`)
      .send({ value: "meh" });

    assert.strictEqual(res.status, 400);
  });

  it("rejects voting on closed idea", async () => {
    const closedRes = await request(app)
      .post("/api/ideas")
      .set("Cookie", `token=${otherToken}`)
      .send({ title: "Closed", description: "Already closed" });

    await request(app)
      .patch(`/api/ideas/${closedRes.body.idea._id}`)
      .set("Cookie", `token=${otherToken}`)
      .send({ status: "closed" });

    const res = await request(app)
      .post(`/api/ideas/${closedRes.body.idea._id}/votes`)
      .set("Cookie", `token=${token}`)
      .send({ value: "good" });

    assert.strictEqual(res.status, 403);
  });
});

describe("DELETE /api/ideas/:id/votes", () => {
  it("removes user's vote", async () => {
    const res = await request(app)
      .delete(`/api/ideas/${ideaId}/votes`)
      .set("Cookie", `token=${token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.score.bad, 0);
  });
});
