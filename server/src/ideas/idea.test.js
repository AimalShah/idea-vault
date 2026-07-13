import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import mongoose from "mongoose";

process.env.JWT_SECRET = "test-secret";

import app from "../app.js";
import User from "../auth/user.model.js";
import Idea from "./idea.model.js";
import Vote from "../votes/vote.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/idea-vault-test";
let token;
let userId;

before(async () => {
  await mongoose.connect(MONGO_URI);
  await Idea.deleteMany({});
  await Vote.deleteMany({});

  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Test User", email: "idea-test@test.com", password: "password123" });
  token = res.body.token;
  userId = res.body.user.id;
});

after(async () => {
  await Idea.deleteMany({});
  await Vote.deleteMany({});
  await mongoose.connection.close();
});

describe("POST /api/ideas", () => {
  it("creates an idea when authenticated", async () => {
    const res = await request(app)
      .post("/api/ideas")
      .set("Cookie", `token=${token}`)
      .send({ title: "Test Idea", description: "A test idea" });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.idea.title, "Test Idea");
    assert.strictEqual(res.body.idea.status, "open");
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app)
      .post("/api/ideas")
      .send({ title: "Test", description: "Test" });

    assert.strictEqual(res.status, 401);
  });

  it("rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/ideas")
      .set("Cookie", `token=${token}`)
      .send({ title: "Test" });

    assert.strictEqual(res.status, 400);
  });
});

describe("GET /api/ideas", () => {
  it("lists ideas with scores", async () => {
    const res = await request(app).get("/api/ideas");
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.ideas));
    assert.ok(res.body.ideas.length > 0);
    assert.ok(res.body.ideas[0].score);
  });
});

describe("GET /api/ideas/:id", () => {
  it("returns a single idea with score", async () => {
    const listRes = await request(app).get("/api/ideas");
    const ideaId = listRes.body.ideas[0]._id;

    const res = await request(app).get(`/api/ideas/${ideaId}`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.idea.score);
  });

  it("returns 404 for nonexistent id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/ideas/${fakeId}`);
    assert.strictEqual(res.status, 404);
  });
});

describe("PATCH /api/ideas/:id", () => {
  it("allows author to update status", async () => {
    const createRes = await request(app)
      .post("/api/ideas")
      .set("Cookie", `token=${token}`)
      .send({ title: "To Close", description: "Will be closed" });

    const res = await request(app)
      .patch(`/api/ideas/${createRes.body.idea._id}`)
      .set("Cookie", `token=${token}`)
      .send({ status: "closed" });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.idea.status, "closed");
  });

  it("rejects non-author update", async () => {
    const createRes = await request(app)
      .post("/api/ideas")
      .set("Cookie", `token=${token}`)
      .send({ title: "Owned", description: "My idea" });
    assert.strictEqual(createRes.status, 201);

    const otherRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Other", email: "other@test.com", password: "password123" });
    assert.strictEqual(otherRes.status, 201);

    const res = await request(app)
      .patch(`/api/ideas/${createRes.body.idea._id}`)
      .set("Cookie", `token=${otherRes.body.token}`)
      .send({ status: "closed" });

    assert.strictEqual(res.status, 403);
  });
});
