import Company from "../models/Company.js";
import User from "../models/User.js";

export const getOfficeAdminId = async (user) => {
  if (!user?.id || user.role === "superadmin") return null;
  if (user.role === "admin") return user.id;

  const account = await User.findById(user.id).select("admin");
  return account?.admin ? String(account.admin) : user.id;
};

export const getCompanyScope = async (user) => {
  if (user?.role === "superadmin") return {};
  if (user?.role === "client") return { client: user.id };
  if (user?.tenantId) {
    const officeAdminId = await getOfficeAdminId(user);
    const officeUsers = await User.distinct("_id", {
      $or: [
        { tenantId: user.tenantId },
        ...(officeAdminId ? [{ _id: officeAdminId }, { admin: officeAdminId }] : []),
      ],
    });
    return {
      $or: [
        { tenantId: user.tenantId },
        ...(officeAdminId ? [{ officeAdmin: officeAdminId }] : []),
        { client: { $in: officeUsers } },
      ],
    };
  }

  const officeAdminId = await getOfficeAdminId(user);
  if (!officeAdminId) return { _id: null };

  const managers = await User.distinct("_id", { admin: officeAdminId, role: "manager" });
  const officeUsers = await User.distinct("_id", {
    $or: [
      { _id: officeAdminId },
      { admin: officeAdminId },
      { manager: { $in: managers } },
    ],
  });
  return {
    $or: [
      { officeAdmin: officeAdminId },
      { client: { $in: officeUsers } },
    ],
  };
};

export const getOfficeCompanyIds = async (user) => {
  if (user?.role === "superadmin") return null;
  const scope = await getCompanyScope(user);
  return Company.distinct("_id", scope);
};
