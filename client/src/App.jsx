import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FileCheck } from "lucide-react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import ClientMaster from "./pages/ClientMaster";
import VerifyOtp from "./pages/VerifyOtp";
import BankInterestForm from "./pages/forms/BankInterestForm";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AddBank from "./pages/AddBank";
import UserManagement from "./pages/UserManagement";
import AppendixAForm from "./pages/forms/AppendixAForm";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import GenerateDocument from "./pages/GenerateDocument";
import Templates from "./pages/Templates";
import AppendixCForm from "./pages/forms/AppendixCForm";
import AppendixBForm from "./pages/forms/AppendixBForm";
import CoveringLetterForm from "./pages/forms/CoveringLetterForm";
import AffidavitForm from "./pages/forms/AffidavitForm";
import DocumentMaster from "./pages/DocumentMaster";
import DisbursementAgreementForm from "./pages/forms/DisbursementAgreement";
import PowerSubsidyForm from "./pages/forms/PowerSubsidyForm";
import InterestSubsidyForm from "./pages/forms/InterestSubsidyForm";
// import GeneratedClientsPage from "./pages/GeneratedDocumentsPage";
// import ClientDocumentsPage from "./pages/ClientDocumentsPage";
import ELPForm from "./pages/forms/ELPForm";
import GeneratedDocumentsPage from "./pages/GeneratedDocumentsPage";
import ProductionExtractForm from "./pages/forms/ProductionExtractForm";
import DocumentApproval from "./pages/DocumentApproval";
import EditDocument from "./pages/EditDocument";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Onboarding from "./pages/Onboarding";
import TenantDashboard from "./pages/TenantDashboard";

const ROLE_DASHBOARD_ROUTES = [
  ["/admin-dashboard", "superadmin"],
  ["/office-dashboard", "admin"],
  ["/manager-dashboard", "manager"],
  ["/maker-dashboard", "intern"],
  ["/client-dashboard", "client"],
];

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC LOGIN */}

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/tenant-dashboard" element={<ProtectedRoute><TenantDashboard /></ProtectedRoute>} />
        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        {ROLE_DASHBOARD_ROUTES.map(([path, role]) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={[role]}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
        ))}
        <Route
          path="/covering-letter-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <CoveringLetterForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-interest-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <BankInterestForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/disbursement-agreement-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <DisbursementAgreementForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* CLIENT MASTER */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute
                allowedRoles={["superadmin", "admin", "manager", "intern"]}
              >
                <Layout>
                  <ClientMaster />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/affidavit-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <AffidavitForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/document-master"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentMaster />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* USERS */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute
                allowedRoles={["superadmin", "admin", "manager"]}
              >
                <Layout>
                  <Users />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/add-bank/:companyId" element={<AddBank />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <Layout>
                  <UserManagement />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedPermissions={["maker"]}
              >
                <Layout>
                  <GenerateDocument />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute
                allowedRoles={["superadmin", "admin", "manager", "intern"]}
              >
                <Layout>
                  <Templates />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appendix-a-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <AppendixAForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/power-subsidy-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <PowerSubsidyForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interest-subsidy-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <InterestSubsidyForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appendix-b-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <AppendixBForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appendix-c-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <AppendixCForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/generated-documents"
          element={
            <ProtectedRoute>
              <Layout>
                <GeneratedDocumentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/elp-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <ELPForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/production-extract-form/:companyId"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductionExtractForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/document-approval"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute
                allowedRoles={["superadmin", "admin", "manager", "intern"]}
              >
                <Layout>
                  <DocumentApproval />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
  path="/edit-document/:documentId"
  element={
    <ProtectedRoute>
      <Layout>
        <EditDocument />
      </Layout>
    </ProtectedRoute>
  }
/>
      </Routes>
    </Router>
  );
}

export default App;
