import test from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { authorizePermission, requireActiveTenant, requireTenantAdmin, requireTenantMembership } from "../middleware/officeWorkflowAccess.js";

const originalFindUser = User.findById;
const originalFindTenant = Tenant.findOne;

const makeResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("tenant access refreshes role, permissions, and tenant ID from the database", async () => {
  let tenantFilter;
  User.findById = () => ({ select: async () => ({
    tenantId: "tenant-from-database",
    role: "admin",
    permissions: ["maker"],
    isActive: true,
    accountStatus: "ACTIVE",
    isApproved: true,
    isVerified: true,
  }) });
  Tenant.findOne = (filter) => {
    tenantFilter = filter;
    return { select: async () => ({ _id: filter._id }) };
  };

  try {
    const req = { user: { id: "user-1", role: "superadmin", permissions: ["approver"], tenantId: "stale-tenant" } };
    const res = makeResponse();
    let continued = false;
    await requireActiveTenant(req, res, () => { continued = true; });
    assert.equal(continued, true);
    assert.deepEqual(tenantFilter, { _id: "tenant-from-database", status: "ACTIVE" });
    assert.equal(req.user.role, "admin");
    assert.equal(req.user.tenantId, "tenant-from-database");
    assert.deepEqual(req.user.permissions, ["maker"]);
    requireTenantAdmin(req, res, () => { continued = true; });
    assert.equal(res.statusCode, 200);
  } finally {
    User.findById = originalFindUser;
    Tenant.findOne = originalFindTenant;
  }
});

test("inactive tenant membership is forbidden", async () => {
  User.findById = () => ({ select: async () => ({
    tenantId: "tenant-1", role: "admin", permissions: [], isActive: true,
    accountStatus: "ACTIVE", isApproved: true, isVerified: true,
  }) });
  Tenant.findOne = () => ({ select: async () => null });
  try {
    const res = makeResponse();
    let continued = false;
    await requireActiveTenant({ user: { id: "user-1" } }, res, () => { continued = true; });
    assert.equal(continued, false);
    assert.equal(res.statusCode, 403);
  } finally {
    User.findById = originalFindUser;
    Tenant.findOne = originalFindTenant;
  }
});

test("platform users without a tenant cannot use tenant routes", async () => {
  User.findById = () => ({ select: async () => ({
    tenantId: null, role: "superadmin", permissions: ["maker", "checker", "approver"],
    isActive: true, accountStatus: "ACTIVE", isApproved: true, isVerified: true,
  }) });
  try {
    const req = { user: { id: "platform-user" } };
    const res = makeResponse();
    let continued = false;
    await requireActiveTenant(req, res, () => { continued = true; });
    assert.equal(continued, true);
    continued = false;
    requireTenantMembership(req, res, () => { continued = true; });
    assert.equal(continued, false);
    assert.equal(res.statusCode, 403);
  } finally {
    User.findById = originalFindUser;
    Tenant.findOne = originalFindTenant;
  }
});

test("deactivated accounts are forbidden and workflow permissions are separate", async () => {
  User.findById = () => ({ select: async () => ({
    tenantId: "tenant-1", role: "manager", permissions: ["maker"], isActive: false,
    accountStatus: "INACTIVE", isApproved: true, isVerified: true,
  }) });
  try {
    const res = makeResponse();
    let continued = false;
    await requireActiveTenant({ user: { id: "user-1" } }, res, () => { continued = true; });
    assert.equal(continued, false);
    assert.equal(res.statusCode, 403);

    const permissionRes = makeResponse();
    let permissionContinued = false;
    authorizePermission("checker")({ user: { role: "manager", permissions: ["maker"] } }, permissionRes, () => { permissionContinued = true; });
    assert.equal(permissionContinued, false);
    assert.equal(permissionRes.statusCode, 403);
  } finally {
    User.findById = originalFindUser;
    Tenant.findOne = originalFindTenant;
  }
});
