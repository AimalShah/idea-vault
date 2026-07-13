import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import mongoose from "mongoose";

process.env.JWT_SECRET = "test-secret";

import app from "../app.js";
import User from "./user.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/idea-vault-test-auth";

before(async () => {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany({});
});

after(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("POST /api/auth/register", () => {
  it("creates a user and returns token + user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "alice@test.com", password: "password123" });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, "alice@test.com");
    assert.strictEqual(res.body.user.name, "Alice");
    assert.ok(!res.body.user.password);
  });

  it("rejects duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice2", email: "alice@test.com", password: "password123" });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.message);
  });

  it("rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "bob@test.com" });

    assert.strictEqual(res.status, 400);
  });
});

describe("POST /api/auth/login", () => {
  it("returns token + user with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.com", password: "password123" });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, "alice@test.com");
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.com", password: "wrongpassword" });

    assert.strictEqual(res.status, 401);
  });

  it("rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.com" });

    assert.strictEqual(res.status, 400);
  });
});

describe("GET /api/auth/me", () => {
  it("returns current user with valid token", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.com", password: "password123" });

    const token = loginRes.body.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", `token=${token}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.email, "alice@test.com");
  });

  it("rejects without token", async () => {
    const res = await request(app).get("/api/auth/me");
    assert.strictEqual(res.status, 401);
  });
});

describe("POST /api/auth/logout", () => {
  it("returns success and clears cookie header", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.com", password: "password123" });

    const token = loginRes.body.token;

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `token=${token}`);
    assert.strictEqual(res.status, 200);

    const setCookie = res.headers["set-cookie"]?.[0] || "";
    assert.ok(setCookie.includes("token=;"), "should clear token cookie");
  });
});
