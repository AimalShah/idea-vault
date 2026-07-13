import { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "./app.js";

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const res = await request(app).get("/api/health");
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, { status: "ok" });
  });
});
