import { useCallback, useEffect, useState } from "react";
import React from "react";
import API from "../services/api";
import {
UserPlus,
Users as UsersIcon,
Pencil,
Trash2,
ChevronDown,
ChevronRight,
RefreshCw,
X,
Save,
Search,
ShieldCheck,
UserRound,
} from "lucide-react";

const INITIAL_FORM = {
fname: "",
lname: "",
email: "",
password: "",
mobile: "",
role: "",
adminId: "",
managerId: "",
};

export default function Users() {
const loggedUser = JSON.parse(localStorage.getItem("user") || "null");
const role = loggedUser?.role?.toLowerCase();
const isManager = role === "manager";

const [form, setForm] = useState(INITIAL_FORM);
const [editingUser, setEditingUser] = useState(null);
const [allUsers, setAllUsers] = useState([]);
const [admins, setAdmins] = useState([]);
const [managers, setManagers] = useState([]);
const [loading, setLoading] = useState(false);
const [fetching, setFetching] = useState(false);
const [expandedAdmins, setExpandedAdmins] = useState({});
const [expandedManagers, setExpandedManagers] = useState({});
const [search, setSearch] = useState("");

const allowedRoles =
role === "superadmin"
? ["admin", "manager", "intern"]
: role === "admin"
? ["manager", "intern"]
: role === "manager"
? ["intern"]
: [];

// ================= FETCH USERS =================

const fetchUsers = useCallback(async () => {
try {
setFetching(true);

  const res = await API.get("/users");
  const users = res.data;

  setAllUsers(users);

  let adminList = users.filter((u) => u.role === "admin");
  let managerList = users.filter((u) => u.role === "manager");

  // Preserve manager-specific hierarchy.
  if (role === "manager") {
    const selfManager = users.find((u) => u._id === loggedUser?._id);

    managerList = selfManager ? [selfManager] : [];

    adminList = [
      {
        _id: "manager-root",
        fname: "My",
        lname: "Team",
      },
    ];

    managerList = managerList.map((manager) => ({
      ...manager,
      admin: "manager-root",
    }));
  }

  setAdmins(adminList);
  setManagers(managerList);
} catch (err) {
  console.error("Failed to fetch users:", err);
  alert("Unable to load users. Please try again.");
} finally {
  setFetching(false);
}

}, [role, loggedUser?._id]);

useEffect(() => {
fetchUsers();
}, [fetchUsers]);

// ================= FORM HANDLERS =================

const handleChange = (e) => {
let { name, value } = e.target;

if (name === "fname" || name === "lname") {
  value = value.replace(/[^A-Za-z ]/g, "");
}

if (name === "mobile") {
  value = value.replace(/\D/g, "").slice(0, 10);
}

if (name === "email") {
  value = value.trim().toLowerCase();
}

setForm((prev) => ({
  ...prev,
  [name]: value,
}));

};

const handleRoleChange = (e) => {
const selectedRole = e.target.value;

setForm((prev) => ({
  ...prev,
  role: selectedRole,
  adminId: "",
  managerId: isManager ? loggedUser._id : "",
}));

};

// ================= HIERARCHY TOGGLES =================

const toggleAdmin = (adminId) => {
setExpandedAdmins((prev) => ({
...prev,
[adminId]: !prev[adminId],
}));
};

const toggleManager = (managerId) => {
setExpandedManagers((prev) => ({
...prev,
[managerId]: !prev[managerId],
}));
};

// ================= EDIT =================

const handleEditClick = (user, e) => {
e?.stopPropagation();

setEditingUser(user);

setForm({
  fname: user.fname || "",
  lname: user.lname || "",
  email: user.email || "",
  password: "",
  mobile: user.mobile || "",
  role: user.role || "",
  adminId: user.admin || "",
  managerId: user.manager || "",
});

window.scrollTo({ top: 0, behavior: "smooth" });

};

const resetForm = () => {
setEditingUser(null);
setForm(INITIAL_FORM);
};

// ================= DELETE =================

const handleDelete = async (id, e) => {
e.stopPropagation();

if (!window.confirm("Are you sure you want to delete this user?")) {
  return;
}

try {
  await API.delete(`/users/${id}`);

  if (editingUser?._id === id) {
    resetForm();
  }

  await fetchUsers();
} catch (err) {
  console.error("Failed to delete user:", err);
  alert(err.response?.data?.msg || "Delete failed.");
}

};

// ================= STATUS =================

const handleStatusChange = async (userId, field, value) => {
try {
await API.put(`/users/${userId}`, {
  [field]: value,
});

  await fetchUsers();
} catch (err) {
  console.error("Failed to update user:", err);
  alert(err.response?.data?.msg || "Update failed.");
}

};

// ================= VALIDATION =================

const validateForm = () => {
if (!form.fname.trim()) {
alert("First Name is required");
return false;
}

if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(form.fname.trim())) {
  alert("First Name can contain only letters");
  return false;
}

if (!form.lname.trim()) {
  alert("Last Name is required");
  return false;
}

if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(form.lname.trim())) {
  alert("Last Name can contain only letters");
  return false;
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
  alert("Please enter a valid email address");
  return false;
}

if (!/^[6-9]\d{9}$/.test(form.mobile)) {
  alert("Enter valid 10 digit mobile number");
  return false;
}

if (!editingUser) {
  if (form.password.length < 8) {
    alert("Password must be at least 8 characters");
    return false;
  }

  if (
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.password)
  ) {
    alert(
      "Password must contain uppercase, lowercase, number and special character",
    );
    return false;
  }
}

if (!form.role) {
  alert("Please select role");
  return false;
}

if (
  role === "superadmin" &&
  form.role === "manager" &&
  !form.adminId
) {
  alert("Please select Admin");
  return false;
}

if (role === "superadmin" && form.role === "intern") {
  if (!form.adminId) {
    alert("Please select Admin");
    return false;
  }

  if (!form.managerId) {
    alert("Please select Manager");
    return false;
  }
}

if (
  role === "admin" &&
  form.role === "intern" &&
  !form.managerId
) {
  alert("Please select Manager");
  return false;
}

return true;

};

// ================= SUBMIT =================

const handleSubmit = async (e) => {
e.preventDefault();

if (!validateForm()) return;

try {
  setLoading(true);

  const payload = {
    ...form,
    managerId:
      isManager && form.role === "intern"
        ? loggedUser._id
        : form.managerId,
  };

  if (!payload.adminId) delete payload.adminId;
  if (!payload.managerId) delete payload.managerId;

  if (editingUser) {
    await API.put(`/users/${editingUser._id}`, payload);
    alert("User Updated");
  } else {
    await API.post("/users", payload);
    alert("User Created");
  }

  resetForm();
  await fetchUsers();
} catch (err) {
  console.error("Failed to save user:", err);
  alert(err.response?.data?.msg || "Operation failed.");
} finally {
  setLoading(false);
}

};

// ================= SEARCH =================

const filteredAdmins = admins.filter((admin) => {
const query = search.trim().toLowerCase();

if (!query) return true;

const adminName = `${admin.fname || ""} ${admin.lname || ""}`.toLowerCase();

const managersUnderAdmin = managers.filter(
  (manager) => String(manager.admin) === String(admin._id),
);

const internsUnderAdmin = allUsers.filter(
  (user) =>
    user.role === "intern" &&
    managersUnderAdmin.some(
      (manager) => String(manager._id) === String(user.manager),
    ),
);

return (
  adminName.includes(query) ||
  managersUnderAdmin.some((manager) =>
    `${manager.fname || ""} ${manager.lname || ""}`
      .toLowerCase()
      .includes(query),
  ) ||
  internsUnderAdmin.some((intern) =>
    `${intern.fname || ""} ${intern.lname || ""}`
      .toLowerCase()
      .includes(query),
  )
);

});

// ================= REUSABLE INPUT =================

const inputClass =
"mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition placeholder focus focus focus";

const labelClass = "text-xs font-medium text-slate-600";

const renderField = (
label,
name,
options = {},
) => (
<div>
<label htmlFor={name} className={labelClass}>
{label}
{options.required !== false && (
<span className="ml-0.5 text-red-500">*</span>
)}
</label>

  <input
    id={name}
    name={name}
    type={options.type || "text"}
    value={form[name]}
    onChange={handleChange}
    placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
    className={inputClass}
    maxLength={options.maxLength}
    pattern={options.pattern}
    title={options.title}
    required={options.required !== false}
    minLength={options.minLength}
    autoComplete={options.autoComplete || "off"}
  />
</div>

);

const renderSelect = (label, name, options, placeholder) => (
<div>
<label htmlFor={name} className={labelClass}>
{label}
<span className="ml-0.5 text-red-500">*</span>
</label>

  <select
    id={name}
    name={name}
    value={form[name]}
    onChange={name === "role" ? handleRoleChange : handleChange}
    className={inputClass}
    required
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>

);

// ================= TABLE HELPERS =================

const StatusCheckbox = ({ user, field, disabled = false }) => (
<input
type="checkbox"
checked={Boolean(user[field])}
disabled={disabled}
aria-label={`{${field} status for ${user.fname || "user"}}`}
onChange={(e) =>
handleStatusChange(user._id, field, e.target.checked)
}
className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 accent-blue-600 focus focus disabled disabled"
/>
);

const ActionButtons = ({ user }) => (
<div className="flex items-center justify-center gap-1">
<button
type="button"
onClick={(e) => handleEditClick(user, e)}
title="Edit user"
aria-label={`Edit ${user.fname || "user"}`}
className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover hover"
>
<Pencil size={14} />
</button>

  <button
    type="button"
    onClick={(e) => handleDelete(user._id, e)}
    title="Delete user"
    aria-label={`Delete ${user.fname || "user"}`}
    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600"
  >
    <Trash2 size={14} />
  </button>
</div>

);

const renderUserRow = (user, type, indent = false) => (
<tr key={user._id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80" >
<td className="px-3 py-2">
<div
className={`flex items-center gap-2 ${ indent ? "pl-5" : "" }`}
>
<div
className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase ${ type === "Admin" ? "bg-blue-50 text-blue-700" : type === "Manager" ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700" }` }
>
{user.fname?.[0] || <UserRound size={13} />}
{user.lname?.[0] || ""}
</div>

      <span className="text-xs font-medium text-slate-800">
        {user.fname} {user.lname}
      </span>
    </div>
  </td>

  <td className="px-3 py-2 text-xs text-slate-600">
    {user.email || "—"}
  </td>

  <td className="px-3 py-2">
    <span
      className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold ${
        type === "Admin"
          ? "bg-blue-50 text-blue-700"
          : type === "Manager"
            ? "bg-violet-50 text-violet-700"
            : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {type}
    </span>
  </td>

  <td className="px-3 py-2 text-center">
    {user._id === "manager-root" ? (
      <span className="text-slate-300">—</span>
    ) : (
      <StatusCheckbox user={user} field="isActive" />
    )}
  </td>

  <td className="px-3 py-2 text-center">
    {user._id === "manager-root" ? (
      <span className="text-slate-300">—</span>
    ) : (
      <StatusCheckbox
        user={user}
        field="isVerified"
        disabled={!user.isActive}
      />
    )}
  </td>

  <td className="px-3 py-2">
    {user._id === "manager-root" ? (
      <span className="text-slate-300">—</span>
    ) : (
      <ActionButtons user={user} />
    )}
  </td>
</tr>

);

// ================= UI =================

return (
<div className="min-h-full">
<div className="mx-auto max-w-[1600px] space-y-4">

    {/* HEADER */}

    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <UsersIcon size={18} />
        </div>

        <div>
          <h1 className="text-lg font-bold leading-tight text-slate-900">
            User Management
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage team members, roles and account access
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={fetchUsers}
        disabled={fetching}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
      >
        <RefreshCw
          size={14}
          className={fetching ? "animate-spin" : ""}
        />
        Refresh
      </button>
    </div>

    {/* CREATE / EDIT FORM */}

    {allowedRoles.length > 0 && (
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              {editingUser ? <Pencil size={15} /> : <UserPlus size={16} />}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                {editingUser ? "Edit User" : "Create User"}
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {editingUser
                  ? "Update the selected user's details"
                  : "Add a team member and assign their role"}
              </p>
            </div>
          </div>

          {editingUser && (
            <button
              type="button"
              onClick={resetForm}
              className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={14} />
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {renderField("First Name", "fname", {
              maxLength: 30,
              pattern: "[A-Za-z ]+",
              title: "Only letters allowed",
            })}

            {renderField("Last Name", "lname", {
              maxLength: 30,
              pattern: "[A-Za-z ]+",
              title: "Only letters allowed",
            })}

            {renderField("Email Address", "email", {
              type: "email",
              maxLength: 100,
              autoComplete: "email",
            })}

            {renderField("Mobile Number", "mobile", {
              maxLength: 10,
              pattern: "[6-9][0-9]{9}",
              title: "Enter a valid 10 digit mobile number",
              autoComplete: "tel",
            })}

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
                {!editingUser && (
                  <span className="ml-0.5 text-red-500">*</span>
                )}
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  editingUser ? "Leave blank to keep unchanged" : "Enter password"
                }
                minLength={8}
                required={!editingUser}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            {renderSelect(
              "User Role",
              "role",
              allowedRoles.map((item) => ({
                value: item,
                label: item.charAt(0).toUpperCase() + item.slice(1),
              })),
              "Select role",
            )}

            {/* SUPERADMIN → MANAGER */}

            {role === "superadmin" && form.role === "manager" && (
              renderSelect(
                "Assign Admin",
                "adminId",
                admins.map((admin) => ({
                  value: admin._id,
                  label: `${admin.fname} ${admin.lname}`,
                })),
                "Select admin",
              )
            )}

            {/* SUPERADMIN → INTERN */}

            {role === "superadmin" && form.role === "intern" && (
              <>
                {renderSelect(
                  "Assign Admin",
                  "adminId",
                  admins.map((admin) => ({
                    value: admin._id,
                    label: `${admin.fname} ${admin.lname}`,
                  })),
                  "Select admin",
                )}

                {renderSelect(
                  "Assign Manager",
                  "managerId",
                  managers
                    .filter(
                      (manager) =>
                        String(manager.admin) === String(form.adminId),
                    )
                    .map((manager) => ({
                      value: manager._id,
                      label: `${manager.fname} ${manager.lname}`,
                    })),
                  "Select manager",
                )}
              </>
            )}

            {/* ADMIN → INTERN */}

            {role === "admin" && form.role === "intern" && (
              renderSelect(
                "Assign Manager",
                "managerId",
                managers
                  .filter(
                    (manager) =>
                      String(manager.admin) === String(loggedUser._id),
                  )
                  .map((manager) => ({
                    value: manager._id,
                    label: `${manager.fname} ${manager.lname}`,
                  })),
                "Select manager",
              )
            )}

            {/* MANAGER → INTERN */}

            {role === "manager" && form.role === "intern" && (
              <div>
                <label className={labelClass}>Assigned Manager</label>
                <input
                  value={`${loggedUser.fname || ""} ${loggedUser.lname || ""}`.trim()}
                  disabled
                  className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`}
                />
              </div>
            )}
          </div>

          {/* FORM ACTIONS */}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-[11px] text-slate-400">
              <span className="text-red-500">*</span> Required fields
            </p>

            <div className="flex items-center gap-2">
              {editingUser && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={14} />
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingUser ? <Save size={14} /> : <UserPlus size={14} />}
                {loading
                  ? "Processing..."
                  : editingUser
                    ? "Save Changes"
                    : "Create User"}
              </button>
            </div>
          </div>
        </form>
      </section>
    )}

    {/* TEAM HIERARCHY */}

    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <UsersIcon size={16} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Team Hierarchy
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              View and manage admins, managers and interns
            </p>
          </div>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Team Member
              </th>
              <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Email
              </th>
              <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Role
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Active
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Verified
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {fetching ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <RefreshCw
                    size={18}
                    className="mx-auto mb-2 animate-spin text-blue-600"
                  />
                  <p className="text-xs text-slate-500">
                    Loading team members...
                  </p>
                </td>
              </tr>
            ) : filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <UsersIcon
                    size={24}
                    className="mx-auto mb-2 text-slate-300"
                  />
                  <p className="text-sm font-medium text-slate-700">
                    No team members found
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try another search term.
                  </p>
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => {
                const managersUnderAdmin = managers.filter(
                  (manager) =>
                    String(manager.admin) === String(admin._id),
                );

                const adminExpanded = Boolean(expandedAdmins[admin._id]);

                return (
                  <React.Fragment key={admin._id}>
                    {/* ADMIN */}

                    <tr className="border-b border-slate-100 bg-blue-50/40 hover:bg-blue-50/70">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {managersUnderAdmin.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => toggleAdmin(admin._id)}
                              aria-label={
                                adminExpanded
                                  ? "Collapse managers"
                                  : "Expand managers"
                              }
                              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-blue-600"
                            >
                              {adminExpanded ? (
                                <ChevronDown size={15} />
                              ) : (
                                <ChevronRight size={15} />
                              )}
                            </button>
                          ) : (
                            <span className="w-6" />
                          )}

                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[10px] font-bold text-blue-700">
                            {(admin.fname?.[0] || "A").toUpperCase()}
                          </div>

                          <span className="text-xs font-semibold text-slate-800">
                            {admin.fname} {admin.lname}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-xs text-slate-500">
                        {admin.email || "—"}
                      </td>

                      <td className="px-3 py-2">
                        <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">
                          {role === "manager" ? "Team" : "Admin"}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-center">
                        {admin._id === "manager-root" ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          <StatusCheckbox
                            user={admin}
                            field="isActive"
                          />
                        )}
                      </td>

                      <td className="px-3 py-2 text-center">
                        {admin._id === "manager-root" ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          <StatusCheckbox
                            user={admin}
                            field="isVerified"
                            disabled={!admin.isActive}
                          />
                        )}
                      </td>

                      <td className="px-3 py-2">
                        {admin._id === "manager-root" ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          <ActionButtons user={admin} />
                        )}
                      </td>
                    </tr>

                    {/* MANAGERS */}

                    {adminExpanded &&
                      managersUnderAdmin.map((manager) => {
                        const interns = allUsers.filter(
                          (user) =>
                            user.role === "intern" &&
                            String(user.manager) === String(manager._id),
                        );

                        const managerExpanded = Boolean(
                          expandedManagers[manager._id],
                        );

                        return (
                          <React.Fragment key={manager._id}>
                            <tr className="border-b border-slate-100 hover:bg-violet-50/40">
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2 pl-7">
                                  {interns.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleManager(manager._id)
                                      }
                                      aria-label={
                                        managerExpanded
                                          ? "Collapse interns"
                                          : "Expand interns"
                                      }
                                      className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                                    >
                                      {managerExpanded ? (
                                        <ChevronDown size={15} />
                                      ) : (
                                        <ChevronRight size={15} />
                                      )}
                                    </button>
                                  ) : (
                                    <span className="w-6" />
                                  )}

                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-700">
                                    {(manager.fname?.[0] || "M").toUpperCase()}
                                  </div>

                                  <span className="text-xs font-medium text-slate-800">
                                    {manager.fname} {manager.lname}
                                  </span>
                                </div>
                              </td>

                              <td className="px-3 py-2 text-xs text-slate-500">
                                {manager.email || "—"}
                              </td>

                              <td className="px-3 py-2">
                                <span className="rounded-md bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">
                                  Manager
                                </span>
                              </td>

                              <td className="px-3 py-2 text-center">
                                <StatusCheckbox
                                  user={manager}
                                  field="isActive"
                                />
                              </td>

                              <td className="px-3 py-2 text-center">
                                <StatusCheckbox
                                  user={manager}
                                  field="isVerified"
                                  disabled={!manager.isActive}
                                />
                              </td>

                              <td className="px-3 py-2">
                                <ActionButtons user={manager} />
                              </td>
                            </tr>

                            {/* INTERNS */}

                            {managerExpanded &&
                              interns.map((intern) =>
                                renderUserRow(intern, "Intern", true),
                              )}
                          </React.Fragment>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-2.5">
        <span className="text-[10px] text-slate-500">
          {filteredAdmins.length} team group
          {filteredAdmins.length !== 1 ? "s" : ""}
        </span>

        <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck size={12} />
          Verified status requires an active account
        </span>
      </div>
    </section>
  </div>
</div>

);
}