import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateChatRequest } from "../../src/server/security/validate-request.ts";

describe("validateChatRequest", () => {
  it("accepts a valid chat request and defaults the model to auto", () => {
    const result = validateChatRequest({ messages: [{ role: "user", content: "Bonjour" }] });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.model, "auto");
  });

  it("rejects an empty message list", () => {
    const result = validateChatRequest({ messages: [] });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "INVALID_REQUEST");
  });

  it("rejects unsupported roles", () => {
    const result = validateChatRequest({ messages: [{ role: "developer", content: "x" }] });
    assert.equal(result.ok, false);
  });

  it("rejects a message exceeding the limit", () => {
    const result = validateChatRequest({ messages: [{ role: "user", content: "x".repeat(8001) }] });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "REQUEST_TOO_LARGE");
  });

  it("rejects a malformed model identifier", () => {
    const result = validateChatRequest({ model: "https://example.com", messages: [{ role: "user", content: "Hi" }] });
    assert.equal(result.ok, false);
  });
});
