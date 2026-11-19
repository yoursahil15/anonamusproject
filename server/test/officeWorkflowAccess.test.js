import test from "node:test";
import assert from "node:assert/strict";
import { requireMakerPermission } from "../middleware/officeWorkflowAccess.js";

const invoke = (user) => {
  let nextCalled = false;
  let responseStatus;
  let responseBody;
  const req = { user };
  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  requireMakerPermission(req, res, () => {
    nextCalled = true;
  });

  return { nextCalled, responseStatus, responseBody };
};

test("tenant admins can generate documents without maker permission", () => {
  const result = invoke({ role: "admin", tenantId: "tenant-1", permissions: [] });
  assert.equal(result.nextCalled, true);
});

test("admins without a tenant still need maker permission", () => {
  const result = invoke({ role: "admin", tenantId: null, permissions: [] });
  assert.equal(result.responseStatus, 403);
  assert.equal(result.responseBody.msg, "Maker permission is required to create documents.");
});

test("makers and superadmins retain document-generation access", () => {
  assert.equal(invoke({ role: "intern", permissions: ["maker"] }).nextCalled, true);
  assert.equal(invoke({ role: "superadmin", permissions: [] }).nextCalled, true);
});
