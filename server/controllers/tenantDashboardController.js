import Company from "../models/Company.js";
import GeneratedDocument from "../models/GeneratedDocument.js";
import User from "../models/User.js";
import { getCompanyScope } from "../utils/officeScope.js";

export const getTenantDashboardStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const companyScope = await getCompanyScope(req.user);
    const [companyIds, totalCompanies, activeCompanies, totalEmployees, activeEmployees] =
      await Promise.all([
        Company.distinct("_id", companyScope),
        Company.countDocuments(companyScope),
        Company.schema.path("isActive")
          ? Company.countDocuments({ ...companyScope, isActive: true })
          : Company.countDocuments(companyScope),
        User.countDocuments({ tenantId, role: { $in: ["manager", "intern"] } }),
        User.countDocuments({
          tenantId,
          role: { $in: ["manager", "intern"] },
          isActive: true,
          accountStatus: { $ne: "INACTIVE" },
        }),
      ]);

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);

    const [summary] = await GeneratedDocument.aggregate([
      { $match: { company: { $in: companyIds } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          draft: { $sum: { $cond: [{ $eq: ["$status", "DRAFT"] }, 1, 0] } },
          pendingCheck: { $sum: { $cond: [{ $eq: ["$status", "PENDING_CHECK"] }, 1, 0] } },
          pendingApproval: { $sum: { $cond: [{ $eq: ["$status", "PENDING_APPROVAL"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
          rejected: {
            $sum: {
              $cond: [{ $in: ["$status", ["REJECTED_BY_CHECKER", "REJECTED_BY_APPROVER"]] }, 1, 0],
            },
          },
          createdThisMonth: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$createdAt", monthStart] }, { $lt: ["$createdAt", monthEnd] }] },
                1,
                0,
              ],
            },
          },
          requiringAttention: {
            $sum: { $cond: [{ $in: ["$status", ["PENDING_CHECK", "PENDING_APPROVAL", "REJECTED_BY_CHECKER", "REJECTED_BY_APPROVER"]] }, 1, 0] },
          },
        },
      },
    ]);

    const documents = summary || {
      total: 0,
      draft: 0,
      pendingCheck: 0,
      pendingApproval: 0,
      approved: 0,
      rejected: 0,
      createdThisMonth: 0,
      requiringAttention: 0,
    };

    return res.json({
      success: true,
      data: {
        companies: { total: totalCompanies, active: activeCompanies },
        employees: { total: totalEmployees, active: activeEmployees },
        documents: {
          total: documents.total,
          draft: documents.draft,
          pendingCheck: documents.pendingCheck,
          pendingApproval: documents.pendingApproval,
          approved: documents.approved,
          rejected: documents.rejected,
          createdThisMonth: documents.createdThisMonth,
          requiringAttention: documents.requiringAttention,
        },
      },
    });
  } catch (error) {
    console.error("Tenant dashboard statistics failed:", error);
    return res.status(500).json({ success: false, msg: "Dashboard statistics could not be loaded." });
  }
};
