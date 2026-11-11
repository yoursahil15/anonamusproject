import express from "express";
import { getTenantDashboardStats } from "../controllers/tenantDashboardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireActiveTenant, requireTenantAdmin, requireTenantMembership } from "../middleware/officeWorkflowAccess.js";
import {
  createTenantCompany,
  getTenantCompany,
  listTenantCompanies,
  listTenantCompanyDocuments,
  updateTenantCompany,
  createTenantEmployee,
  getTenantEmployee,
  listTenantEmployees,
  setTenantEmployeeStatus,
  updateTenantEmployee,
  getTenantRoles,
  getTenantEmployeePermissions,
  updateTenantEmployeePermissions,
} from "../controllers/tenantManagementController.js";
import {
  approveTenantDocument,
  checkTenantDocument,
  downloadTenantDocument,
  editTenantRejectedDocument,
  getTenantDocument,
  getTenantDocumentHistory,
  listTenantDocuments,
  listTenantWorkflow,
  submitTenantDocument,
} from "../controllers/tenantDocumentController.js";
import { authorizePermission } from "../middleware/officeWorkflowAccess.js";
import { getTenantTemplate, listTenantTemplates } from "../controllers/tenantTemplateController.js";
import { createTenantGeneratedDocument } from "../controllers/documentController.js";
import {
  approvalStatisticsReport,
  companyStatisticsReport,
  employeeWorkloadReport,
  listTenantActivity,
  listTenantNotifications,
  markAllTenantNotificationsRead,
  markTenantNotificationRead,
  monthlyDocumentsReport,
  tenantProfile,
  updateTenantProfile,
  workflowStatisticsReport,
} from "../controllers/tenantSupportController.js";

const router = express.Router();

router.use(protect, requireActiveTenant, requireTenantMembership);

router.get("/dashboard/stats", protect, requireActiveTenant, requireTenantAdmin, getTenantDashboardStats);

router.get("/companies", protect, requireActiveTenant, requireTenantAdmin, listTenantCompanies);
router.post("/companies", protect, requireActiveTenant, requireTenantAdmin, createTenantCompany);
router.get("/companies/:companyId/documents", protect, requireActiveTenant, requireTenantAdmin, listTenantCompanyDocuments);
router.get("/companies/:companyId", protect, requireActiveTenant, requireTenantAdmin, getTenantCompany);
router.put("/companies/:companyId", protect, requireActiveTenant, requireTenantAdmin, updateTenantCompany);

router.get("/employees", protect, requireActiveTenant, listTenantEmployees);
router.post("/employees", protect, requireActiveTenant, requireTenantAdmin, createTenantEmployee);
router.get("/employees/:employeeId", protect, requireActiveTenant, getTenantEmployee);
router.put("/employees/:employeeId", protect, requireActiveTenant, requireTenantAdmin, updateTenantEmployee);
router.patch("/employees/:employeeId/status", protect, requireActiveTenant, requireTenantAdmin, setTenantEmployeeStatus);
router.get("/roles", protect, requireActiveTenant, getTenantRoles);
router.get("/employees/:employeeId/permissions", protect, requireActiveTenant, getTenantEmployeePermissions);
router.put("/employees/:employeeId/permissions", protect, requireActiveTenant, requireTenantAdmin, updateTenantEmployeePermissions);

router.get("/documents", protect, requireActiveTenant, requireTenantAdmin, listTenantDocuments);
router.post("/documents", protect, requireActiveTenant, authorizePermission("maker"), createTenantGeneratedDocument);
router.get("/documents/:documentId/history", protect, requireActiveTenant, requireTenantAdmin, getTenantDocumentHistory);
router.get("/documents/:documentId/download", protect, requireActiveTenant, downloadTenantDocument);
router.put("/documents/:documentId/edit", protect, requireActiveTenant, editTenantRejectedDocument);
router.get("/documents/:documentId", protect, requireActiveTenant, requireTenantAdmin, getTenantDocument);
router.post("/documents/:documentId/submit", protect, requireActiveTenant, authorizePermission("maker"), submitTenantDocument);
router.post("/documents/:documentId/check", protect, requireActiveTenant, authorizePermission("checker"), checkTenantDocument);
router.post("/documents/:documentId/approve", protect, requireActiveTenant, authorizePermission("approver"), approveTenantDocument);
router.get("/workflow/:lane", protect, requireActiveTenant, listTenantWorkflow);
router.get("/templates", protect, requireActiveTenant, listTenantTemplates);
router.get("/templates/:templateId", protect, requireActiveTenant, getTenantTemplate);

router.get("/reports/monthly-documents", protect, requireActiveTenant, requireTenantAdmin, monthlyDocumentsReport);
router.get("/reports/company-statistics", protect, requireActiveTenant, requireTenantAdmin, companyStatisticsReport);
router.get("/reports/employee-workload", protect, requireActiveTenant, requireTenantAdmin, employeeWorkloadReport);
router.get("/reports/workflow-statistics", protect, requireActiveTenant, requireTenantAdmin, workflowStatisticsReport);
router.get("/reports/approval-statistics", protect, requireActiveTenant, requireTenantAdmin, approvalStatisticsReport);

router.get("/activity-logs", protect, requireActiveTenant, requireTenantAdmin, listTenantActivity);
router.get("/notifications", protect, requireActiveTenant, listTenantNotifications);
router.patch("/notifications/read-all", protect, requireActiveTenant, markAllTenantNotificationsRead);
router.patch("/notifications/:notificationId/read", protect, requireActiveTenant, markTenantNotificationRead);

router.get("/profile", protect, requireActiveTenant, tenantProfile);
router.put("/profile", protect, requireActiveTenant, requireTenantAdmin, updateTenantProfile);

export default router;
