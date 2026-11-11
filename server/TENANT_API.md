# Tenant Admin API

Tenant routes are mounted at `/api/tenant`. Send `Authorization: Bearer <JWT>` on every request. Tenant membership, role, account state, tenant status, and workflow permissions are loaded from MongoDB; request body `tenantId` values are ignored for access control. Users without tenant membership, including platform accounts, cannot use these endpoints. List endpoints use `page` (default `1`) and `limit` (default `20`, maximum `100`) unless stated otherwise.

## Dashboard and office profile

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/dashboard/stats` | Tenant admin | Aggregated companies, employees, and document counts |
| GET | `/profile` | Active tenant member | Read office profile |
| PUT | `/profile` | Tenant admin | Update allowlisted office profile fields |

Example stats response:

```json
{
  "success": true,
  "data": {
    "companies": { "total": 12, "active": 12 },
    "employees": { "total": 7, "active": 6 },
    "documents": {
      "total": 40,
      "draft": 2,
      "pendingCheck": 3,
      "pendingApproval": 1,
      "approved": 30,
      "rejected": 4,
      "createdThisMonth": 8,
      "requiringAttention": 8
    }
  }
}
```

The current Company model has no active flag, so `companies.active` equals `companies.total`. The update endpoint accepts only existing Tenant fields: `name`, `firmType`, `contactEmail`, `contactNumber`, `address`, `professionalDetails`, `businessDetails`, and `settings`; owner, status, slug, and onboarding fields are not writable.

## Companies

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/companies?page=1&limit=20&search=...&sort=name&order=asc` | Tenant admin | Paginated tenant companies |
| POST | `/companies` | Tenant admin | Create a company using current Company schema fields |
| GET | `/companies/:companyId` | Tenant admin | Read an owned company |
| PUT | `/companies/:companyId` | Tenant admin | Update allowlisted company fields |
| GET | `/companies/:companyId/documents?page=1&limit=20&status=APPROVED` | Tenant admin | List company documents |

Company creation and updates use `nameOfCompany`, `pan`, `gst`, address/contact/certificate fields, signatories, and incorporation/operating period fields from the existing Company model. A same-tenant PAN duplicate returns `409`. Company status changes are not exposed because the model has no status field.

Paginated response shape:

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

## Employees and permissions

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/employees?page=1&limit=20&search=...&role=manager&status=active` | Admin, manager, or intern (scoped to self/team as applicable) | List employees |
| POST | `/employees` | Tenant admin | Create a `manager` or `intern` with a hashed password |
| GET | `/employees/:employeeId` | Tenant admin, manager, or self | Read employee |
| PUT | `/employees/:employeeId` | Tenant admin | Update basic employee fields |
| PATCH | `/employees/:employeeId/status` | Tenant admin | Body: `{ "isActive": false }` |
| GET | `/roles` | Active tenant member | List schema-supported roles and workflow permissions |
| GET | `/employees/:employeeId/permissions` | Scoped employee reader | Read workflow permissions |
| PUT | `/employees/:employeeId/permissions` | Tenant admin | Body: `{ "permissions": ["maker", "checker"] }` |

Tenant employee creation follows the existing password-hash/OTP sign-in flow; it does not send a separate invitation email. `maker`, `checker`, and `approver` remain workflow permissions, separate from the `admin`, `manager`, and `intern` roles.

## Documents and workflow

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/documents?page=1&limit=20&companyId=...&documentType=APPENDIX_A&employeeId=...&status=PENDING_CHECK&from=2026-01-01&to=2026-12-31&search=...` | Tenant admin | Paginated tenant documents |
| POST | `/documents` | Member with `maker` permission | Generate through existing generator/storage services |
| GET | `/documents/:documentId` | Tenant admin | Read owned document |
| GET | `/documents/:documentId/history` | Tenant admin | Workflow and edit history |
| GET | `/documents/:documentId/download` | Document participant; tenant admin for approved docs | Protected file download |
| PUT | `/documents/:documentId/edit` | Maker or assigned checker of `REJECTED_BY_CHECKER` document | Correct and resubmit through the existing generator |
| GET | `/workflow/pending-check` | Checker or tenant admin | Pending checker queue |
| GET | `/workflow/pending-approval` | Approver or tenant admin | Pending approval queue |
| GET | `/workflow/rejected` | Tenant admin | Rejected documents and reasons |
| GET | `/workflow/approved` | Tenant admin | Approved documents |
| POST | `/documents/:documentId/submit` | Maker of a `DRAFT` document | Move it to `PENDING_CHECK` |
| POST | `/documents/:documentId/check` | Checker | Body: `{ "action": "approve" }` or `{ "action": "reject", "reason": "..." }` |
| POST | `/documents/:documentId/approve` | Approver | Body: `{ "action": "approve" }` or `{ "action": "reject", "reason": "..." }` |

Generation request example:

```json
{
  "companyId": "<company ObjectId>",
  "documentType": "COVERING_LETTER",
  "data": { "subject": "Application" }
}
```

The generator merges company/type-specific DocumentMaster data with request data, stores the generated file through the existing storage service, associates the authenticated maker, and starts it as `PENDING_CHECK`. Invalid tenant/company pairs return `404`; invalid document types return `400`. Workflow transitions are atomic, and rejection requires a reason. `workflowHistory` stores actor, action, status transition, remark, and time.

## Templates

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/templates` | Active tenant member | List document types supported by the current generator |
| GET | `/templates/:templateId` | Active tenant member | Read a supported document type |

There is no template model or tenant template upload/update lifecycle in this project, so these routes expose shared generator types as read-only entries. They do not imply tenant-specific template files.

## Reports, activity, and notifications

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/reports/monthly-documents?from=...&to=...` | Tenant admin | Monthly document counts |
| GET | `/reports/company-statistics` | Tenant admin | Documents grouped by company |
| GET | `/reports/employee-workload` | Tenant admin | Documents grouped by maker |
| GET | `/reports/workflow-statistics` | Tenant admin | Counts grouped by status |
| GET | `/reports/approval-statistics` | Tenant admin | Approval/rejection history by month |
| GET | `/activity-logs?page=1&limit=20&employeeId=...&action=...&resource=...&from=...&to=...` | Tenant admin | Read tenant activity |
| GET | `/notifications?page=1&limit=20` | Active tenant member | Read notifications for the current user |
| PATCH | `/notifications/:notificationId/read` | Notification owner | Mark one read |
| PATCH | `/notifications/read-all` | Current user | Mark all own notifications read |

Activity logs are append-only through the API. New management and workflow operations record activity; workflow actions generate notifications for checker/approver permission holders and the maker. Notification visibility is user-specific.

## Status codes

The APIs use `400` for invalid inputs, `401` for missing/invalid JWTs, `403` for authorization failures or inactive accounts/tenants, `404` for missing or out-of-scope resources, `409` for duplicates or stale workflow transitions, `201` for created resources, and `500` for unexpected failures.

## Remaining integration/verification work

- Wire the existing TenantDashboard UI to `/api/tenant/dashboard/stats` and migrate the company/employee/report panels to the new paginated endpoints.
- Add a Company active-status field only after the product defines its status semantics; then implement the status route and meaningful active count.
- Add a tenant template model only if the product needs private template upload/versioning; current generators are shared and read-only.
- The repository has no test framework or test database configured. Database-backed tenant isolation, approval, persistence, and file-download integration tests still need to run in a configured test environment.
