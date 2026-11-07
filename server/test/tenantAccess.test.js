import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";
import { legacyTenantGuard, legacyUserTenantGuard, legacyGeneratedListGuard, tenantScopedCompanyGuard } from "../middleware/legacyTenantGuard.js";
import { getCompanyScope, getOfficeCompanyIds } from "../utils/officeScope.js";

process.env.JWT_SECRET = "tenant-access-test-secret";

const makeRequest = (identity, method, path) => ({
  method,
  path,
  headers: {
    authorization: `Bearer ${jwt.sign(identity, process.env.JWT_SECRET)}`,
  },
});

const invoke = (middleware, req) => {
  let nextCalled = false;
  let responseStatus;
  let responseBody;
  const res = {
    status(code) { responseStatus = code; return this; },
    json(body) { responseBody = body; return this; },
  };
  middleware(req, res, () => { nextCalled = true; });
  return { nextCalled, responseStatus, responseBody };
};

test("legacy tenant guard still denies unscoped tenant routes", () => {
  const result = invoke(legacyTenantGuard, makeRequest({ id: "u1", role: "admin", tenantId: "t1" }, "GET", "/uploads"));
  assert.equal(result.responseStatus, 403);
  assert.equal(result.nextCalled, false);
});

test("tenant user guard opens the scoped member list and admin/manager staff creation routes", () => {
  const tenantAdmin = { id: "u1", role: "admin", tenantId: "t1" };
  assert.equal(invoke(legacyUserTenantGuard, makeRequest(tenantAdmin, "GET", "/")).nextCalled, true);
  assert.equal(invoke(legacyUserTenantGuard, makeRequest(tenantAdmin, "POST", "/")).nextCalled, true);
  assert.equal(invoke(legacyUserTenantGuard, makeRequest(tenantAdmin, "GET", "/u2")).responseStatus, 403);
  const tenantIntern = { ...tenantAdmin, role: "intern" };
  assert.equal(invoke(legacyUserTenantGuard, makeRequest(tenantIntern, "GET", "/")).nextCalled, true);
  assert.equal(invoke(legacyUserTenantGuard, makeRequest(tenantIntern, "POST", "/")).responseStatus, 403);
});

test("company guard delegates only existing scoped company routes", () => {
  const tenantAdmin = { id: "u1", role: "admin", tenantId: "t1" };
  assert.equal(invoke(tenantScopedCompanyGuard, makeRequest(tenantAdmin, "GET", "/")).nextCalled, true);
  assert.equal(invoke(tenantScopedCompanyGuard, makeRequest(tenantAdmin, "GET", "/0123456789abcdef01234567")).nextCalled, true);
  assert.equal(invoke(tenantScopedCompanyGuard, makeRequest(tenantAdmin, "PUT", "/update/0123456789abcdef01234567")).nextCalled, true);
  assert.equal(invoke(tenantScopedCompanyGuard, makeRequest(tenantAdmin, "GET", "/export")).responseStatus, 403);
});

test("generated-document guard keeps tenant access limited to scoped list, download, and generation routes", () => {
  const tenantAdmin = { id: "u1", role: "admin", tenantId: "t1" };
  assert.equal(invoke(legacyGeneratedListGuard, makeRequest(tenantAdmin, "GET", "/generated")).nextCalled, true);
  assert.equal(invoke(legacyGeneratedListGuard, makeRequest(tenantAdmin, "GET", "/generated/doc-id/file")).nextCalled, true);
  assert.equal(invoke(legacyGeneratedListGuard, makeRequest(tenantAdmin, "POST", "/generate-word/company-id")).nextCalled, true);
  assert.equal(invoke(legacyGeneratedListGuard, makeRequest(tenantAdmin, "GET", "/approval-documents")).responseStatus, 403);
});

test("tenant company scope is derived from authenticated tenant membership", async () => {
  const originalDistinct = User.distinct;
  let capturedMembershipQuery;
  User.distinct = async (field, query) => {
    assert.equal(field, "_id");
    capturedMembershipQuery = query;
    return ["admin-id", "member-id"];
  };
  try {
    const query = await getCompanyScope({ id: "admin-id", role: "admin", tenantId: "signed-tenant-id" });
    assert.deepEqual(capturedMembershipQuery, {
      $or: [
        { tenantId: "signed-tenant-id" },
        { _id: "admin-id" },
        { admin: "admin-id" },
      ],
    });
    assert.deepEqual(query.$or, [
      { tenantId: "signed-tenant-id" },
      { officeAdmin: "admin-id" },
      { client: { $in: ["admin-id", "member-id"] } },
    ]);
  } finally {
    User.distinct = originalDistinct;
  }
});

test("document company IDs are selected using the same tenant scope", async () => {
  const originalUserDistinct = User.distinct;
  const originalCompanyDistinct = Company.distinct;
  let companyQuery;
  User.distinct = async () => ["admin-id"];
  Company.distinct = async (field, query) => {
    assert.equal(field, "_id");
    companyQuery = query;
    return ["company-in-tenant"];
  };
  try {
    const ids = await getOfficeCompanyIds({ id: "admin-id", role: "admin", tenantId: "tenant-a" });
    assert.deepEqual(ids, ["company-in-tenant"]);
    assert.ok(companyQuery.$or.some((scope) => scope.tenantId === "tenant-a"));
  } finally {
    User.distinct = originalUserDistinct;
    Company.distinct = originalCompanyDistinct;
  }
});
