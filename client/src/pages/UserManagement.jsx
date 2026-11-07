import { useCallback, useEffect, useMemo, useState } from "react";
import {
Users,
Search,
RefreshCw,
ShieldCheck,
LoaderCircle,
Mail,
AlertCircle,
} from "lucide-react";
import API from "../services/api";

const PERMISSIONS = ["maker", "checker", "approver"];

export default function UserManagement() {
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [updatingUsers, setUpdatingUsers] = useState({});
const [search, setSearch] = useState("");
const [error, setError] = useState("");

// Fetch users
const fetchUsers = useCallback(async () => {
try {
setLoading(true);
setError("");

  const res = await API.get("/users");

  setUsers(
    res.data.filter((user) => {
      const role = user.role?.toLowerCase();
      return role !== "client" && role !== "superadmin";
    }),
  );
} catch (err) {
  console.error("Failed to fetch users:", err);
  setError("Unable to load users. Please try again.");
} finally {
  setLoading(false);
}

}, []);

useEffect(() => {
fetchUsers();
}, [fetchUsers]);

// Update active status
const handleToggleActive = async (userId, isActive) => {
const previousUsers = users;

setUpdatingUsers((prev) => ({ ...prev, [userId]: true }));
setError("");

setUsers((prev) =>
  prev.map((user) =>
    user._id === userId ? { ...user, isActive } : user,
  ),
);

try {
  await API.put(`/users/${userId}`, { isActive });
} catch (err) {
  console.error("Failed to update status:", err);
  setUsers(previousUsers);
  setError("Failed to update account status.");
} finally {
  setUpdatingUsers((prev) => ({ ...prev, [userId]: false }));
}

};

// Update permissions
const handleTogglePermission = async (userId, permission, checked) => {
const user = users.find((item) => item._id === userId);
if (!user) return;

const previousUsers = users;
const currentPermissions = user.permissions || [];

const updatedPermissions = checked
  ? [...new Set([...currentPermissions, permission])]
  : currentPermissions.filter((item) => item !== permission);

setUpdatingUsers((prev) => ({ ...prev, [userId]: true }));
setError("");

setUsers((prev) =>
  prev.map((item) =>
    item._id === userId
      ? { ...item, permissions: updatedPermissions }
      : item,
  ),
);

try {
  await API.put(`/users/permissions/${userId}`, {
    permissions: updatedPermissions,
  });
} catch (err) {
  console.error("Failed to update permissions:", err);
  setUsers(previousUsers);
  setError("Failed to update permissions.");
} finally {
  setUpdatingUsers((prev) => ({ ...prev, [userId]: false }));
}

};

// Search users
const filteredUsers = useMemo(() => {
const query = search.trim().toLowerCase();

if (!query) return users;

return users.filter((user) => {
  const name = `${user.fname || ""} ${user.lname || ""}`.toLowerCase();

  return (
    name.includes(query) ||
    (user.email || "").toLowerCase().includes(query) ||
    (user.role || "").toLowerCase().includes(query)
  );
});

}, [users, search]);

const activeCount = users.filter((user) => user.isActive).length;

return (
<div className="min-h-full ">
<div className="mx-auto max-w-[1600px] space-y-4">

    {/* HEADER */}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <Users size={18} />
        </div>

        <div>
          <h1 className="text-lg font-bold leading-tight text-slate-900">
            User Management
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage users, account status and permissions
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={fetchUsers}
        disabled={loading}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
      >
        <RefreshCw
          size={14}
          className={loading ? "animate-spin" : ""}
        />
        Refresh
      </button>
    </div>

    {/* COMPACT TOOLBAR */}
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email or role..."
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-slate-600">
          Total: <strong className="text-slate-900">{users.length}</strong>
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active: <strong>{activeCount}</strong>
        </span>

        <span className="inline-flex items-center gap-1.5 text-slate-500">
          <ShieldCheck size={14} />
          Role permissions
        </span>
      </div>
    </div>

    {/* ERROR */}
    {error && (
      <div
        role="alert"
        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
      >
        <AlertCircle size={15} className="shrink-0" />
        <span className="flex-1">{error}</span>
        <button
          type="button"
          onClick={() => setError("")}
          className="font-semibold hover:text-red-900"
        >
          Dismiss
        </button>
      </div>
    )}

    {/* TABLE */}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Team Members
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Configure workflow access for each user
          </p>
        </div>

        {!loading && (
          <span className="text-xs text-slate-500">
            {filteredUsers.length} result
            {filteredUsers.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                User Details
              </th>

              <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Role
              </th>

              <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th
                colSpan={3}
                className="border-l border-slate-200 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                Workflow Permissions
              </th>
            </tr>

            <tr className="border-b border-slate-200 bg-white">
              <th colSpan={3} className="px-4 py-1" />

              {PERMISSIONS.map((permission) => (
                <th
                  key={permission}
                  className="border-l border-slate-100 px-3 py-2 text-center text-[10px] font-semibold capitalize text-slate-600"
                >
                  {permission}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                    <LoaderCircle
                      size={17}
                      className="animate-spin text-blue-600"
                    />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Users
                    size={24}
                    className="mx-auto mb-2 text-slate-300"
                  />
                  <p className="text-sm font-medium text-slate-700">
                    No users found
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try a different search term.
                  </p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const permissions = user.permissions || [];
                const updating = Boolean(updatingUsers[user._id]);
                const name =
                  `${user.fname || ""} ${user.lname || ""}`.trim() ||
                  "Unnamed User";

                return (
                  <tr
                    key={user._id}
                    className="transition-colors hover:bg-blue-50/30"
                  >
                    {/* USER */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold uppercase text-blue-700 ring-1 ring-blue-100">
                          {(user.fname?.[0] || user.email?.[0] || "U") +
                            (user.lname?.[0] || "")}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {name}
                          </p>
                          <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500">
                            <Mail size={11} className="shrink-0" />
                            {user.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="px-3 py-2.5">
                      <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold capitalize text-slate-600">
                        {user.role || "N/A"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(user.isActive)}
                        aria-label={`Toggle status for ${name}`}
                        disabled={updating}
                        onClick={() =>
                          handleToggleActive(user._id, !user.isActive)
                        }
                        className={`relative inline-flex h-[18px] w-8 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.isActive
                            ? "bg-emerald-500"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
                            user.isActive
                              ? "translate-x-[17px]"
                              : "translate-x-[3px]"
                          }`}
                        />
                      </button>

                      <p
                        className={`mt-1 text-[10px] font-medium ${
                          user.isActive
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </p>
                    </td>

                    {/* PERMISSIONS */}
                    {PERMISSIONS.map((permission) => (
                      <td
                        key={permission}
                        className="border-l border-slate-100 px-3 py-2.5 text-center"
                      >
                        <input
                          type="checkbox"
                          aria-label={`${permission} permission for ${name}`}
                          checked={permissions.includes(permission)}
                          disabled={updating}
                          onChange={(e) =>
                            handleTogglePermission(
                              user._id,
                              permission,
                              e.target.checked,
                            )
                          }
                          className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 accent-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      {!loading && filteredUsers.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-2 text-[10px] text-slate-500">
          <span>
            Showing {filteredUsers.length} of {users.length} users
          </span>

          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={12} />
            Changes are saved automatically
          </span>
        </div>
      )}
    </div>
  </div>
</div>

);
}