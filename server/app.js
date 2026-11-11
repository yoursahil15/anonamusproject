import express from "express";
import cors from "cors";

// =====================================
// ROUTE IMPORTS
// =====================================

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import documentMasterRoutes from "./routes/documentMasterRoutes.js";
import companyDocumentRoutes from "./routes/companyDocumentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";

// =====================================
// MIDDLEWARE IMPORTS
// =====================================

import {
  legacyTenantGuard,
  legacyUserTenantGuard,
  tenantScopedCompanyGuard,
  legacyGeneratedListGuard,
} from "./middleware/legacyTenantGuard.js";

const app = express();

// =====================================
// CORS CONFIGURATION
// =====================================

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (for example, Postman or server-to-server requests).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
    credentials: true,
  })
);

// =====================================
// BODY PARSING MIDDLEWARE
// =====================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// =====================================
// AUTHENTICATION ROUTES
// =====================================

// Register and login routes.
// These routes do not use legacyTenantGuard.

app.use("/api/auth", authRoutes);
app.use("/api/tenant", tenantRoutes);

// =====================================
// TENANT PROTECTION
// =====================================

// Apply tenant middleware only to protected APIs.

app.use("/api/uploads", legacyTenantGuard);
app.use("/api/users", legacyUserTenantGuard);
app.use("/api/companies", tenantScopedCompanyGuard);
app.use("/documents", legacyTenantGuard);
app.use("/api/banks", legacyTenantGuard);
app.use("/api/documents", legacyGeneratedListGuard);
app.use("/api/document-master", legacyTenantGuard);
app.use("/api/company-documents", legacyTenantGuard);

// =====================================
// API ROUTES
// =====================================

app.use("/api/uploads", uploadRoutes);

app.use("/api/users", userRoutes);

app.use("/api/companies", companyRoutes);

app.use("/documents", documentRoutes);

app.use("/api/banks", bankRoutes);

app.use("/api/documents", documentRoutes);

app.use("/api/document-master", documentMasterRoutes);

app.use("/api/company-documents", companyDocumentRoutes);

// =====================================
// HEALTH CHECK ROUTE
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server API Running on port 5000",
  });
});

// =====================================
// 404 ROUTE
// =====================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  if (res.headersSent) {
    return next(err);
  }

  // Handle duplicate MongoDB records.
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate record already exists.",
      field: Object.keys(err.keyValue || {}),
    });
  }

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal Server Error"
        : err.message || "Request failed",
  });
});

// =====================================
// EXPORT APP
// =====================================

export default app;
