import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ModelRegistry } from "../../src/server/chat/model-registry.ts";
import { NoModelAvailableError, selectModel } from "../../src/server/chat/model-router.ts";
import { modelRegistry } from "../../src/server/chat/model-registry.ts";

describe("model routing", () => {
  it("returns no model when the application registry is empty", () => {
    assert.throws(() => selectModel("auto"), NoModelAvailableError);
  });

  it("does not allow an arbitrary model identifier", () => {
    assert.throws(() => selectModel("made-up-model"));
  });

  it("rejects duplicate model ids", () => {
    const registry = new ModelRegistry();
    const adapter = { providerId: "test", isConfigured: () => false, generate: async () => ({ text: "", modelId: "x", providerId: "test", latencyMs: 0 }) };
    registry.register({ id: "test-model", providerId: "test", capabilities: ["chat"], enabled: true, adapter });
    assert.throws(() => registry.register({ id: "test-model", providerId: "test", capabilities: ["chat"], enabled: true, adapter }));
  });

  it("documents that no external model is registered yet", () => {
    assert.equal(modelRegistry.listAvailable().length, 0);
  });
});
