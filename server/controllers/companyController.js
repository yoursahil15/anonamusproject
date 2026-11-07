import Company from "../models/Company.js";
import { getCompanyScope, getOfficeAdminId } from "../utils/officeScope.js";
import XLSX from "xlsx";

// ================= CREATE COMPANY =================

export const createCompany = async (req, res) => {
  try {
    const {
      nameOfCompany,
      pan,
      gst,
      factoryAddress,
      registeredOfficeAddress,
      ecNumber,
      ecDate,
      udyamNumber,
      mpcbDetails,
      contactPerson,
      phone,
      email,
      authorizedSignatories,
      dateOfIncorporation,
      operatingPeriodFrom,
      operatingPeriodTo,
      operatingPeriod,
    } = req.body;

    // ================= VALIDATION =================

    const requiredFields = {
      nameOfCompany: "Company name",
      pan: "PAN",
      gst: "GST",
      factoryAddress: "Factory address",
      registeredOfficeAddress: "Registered office address",
      ecNumber: "EC number",
      ecDate: "EC date",
      udyamNumber: "Udyam number",
      mpcbDetails: "MPCB details",
      contactPerson: "Contact person",
      phone: "Phone number",
      email: "Email address",
      dateOfIncorporation: "Date of incorporation",
    };
    const missingField = Object.entries(requiredFields).find(
      ([field]) =>
        req.body[field] === undefined ||
        req.body[field] === null ||
        String(req.body[field]).trim() === "",
    );

    if (missingField) {
      return res.status(400).json({
        msg: `${missingField[1]} is required`,
      });
    }

    if (!Array.isArray(authorizedSignatories) || authorizedSignatories.length === 0) {
      return res.status(400).json({ msg: "Add at least one authorized person" });
    }

    const invalidSignatoryIndex = authorizedSignatories.findIndex(
      (signatory) =>
        !signatory ||
        !String(signatory.name || "").trim() ||
        !String(signatory.role || "").trim() ||
        !String(signatory.mobileNumber || "").trim(),
    );
    if (invalidSignatoryIndex !== -1) {
      return res.status(400).json({
        msg: `Authorized person ${invalidSignatoryIndex + 1} needs a name, role, and mobile number`,
      });
    }

    // ================= ONLY ONE DEFAULT SIGNATORY =================

    const defaultCount = authorizedSignatories.filter(
      (signatory) => signatory.isDefault === true,
    ).length;

    if (defaultCount > 1) {
      return res.status(400).json({
        msg: "Only one authorized signatory can be selected for printing",
      });
    }

    // ================= CREATE COMPANY =================

    const ownership = req.user?.role === "superadmin"
      ? {}
      : {
          officeAdmin: await getOfficeAdminId(req.user),
          tenantId: req.user?.tenantId || undefined,
          ...(req.user?.role === "client" ? { client: req.user.id } : {}),
        };

    const company = await Company.create({
      ...ownership,
      nameOfCompany,
      pan,
      gst,
      factoryAddress,
      registeredOfficeAddress,
      ecNumber,
      ecDate,
      udyamNumber,
      mpcbDetails,
      contactPerson,
      phone,
      email,
      authorizedSignatories,
      dateOfIncorporation,
      operatingPeriodFrom: operatingPeriodFrom || undefined,
      operatingPeriodTo: operatingPeriodTo || undefined,
      operatingPeriod: operatingPeriod === "" ? undefined : operatingPeriod,
    });

    res.status(201).json({
      msg: "Company created successfully",
      company,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        msg: error.name === "ValidationError"
          ? Object.values(error.errors).map((item) => item.message).join("; ")
          : `${error.path} has an invalid value`,
      });
    }
    console.error("Company creation failed", { name: error.name, message: error.message });
    return res.status(500).json({ msg: "Unable to create company" });
  }
};

// ================= GET ALL COMPANIES =================

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find(await getCompanyScope(req.user));

    res.json(companies);
  } catch (error) {
    console.error("Failed to fetch companies", { name: error.name, message: error.message });
    res.status(500).json({ msg: "Unable to load companies" });
  }
};

// ================= BULK UPLOAD =================

export const uploadCompanies = async (req, res) => {
  try {
    const filePath = req.file.path;

    const workbook = XLSX.readFile(filePath);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(sheet);

    let companies = [];

    for (let row of data) {
      companies.push({
        ...(req.user?.role === "superadmin" ? {} : {
          officeAdmin: await getOfficeAdminId(req.user),
          tenantId: req.user?.tenantId || undefined,
        }),
        nameOfCompany: row.nameOfCompany,
        pan: row.pan,
        gst: row.gst,

        factoryAddress: row.factoryAddress,

        registeredOfficeAddress: row.registeredOfficeAddress,

        ecNumber: row.ecNumber,

        ecDate: row.ecDate,

        udyamNumber: row.udyamNumber,

        mpcbDetails: row.mpcbDetails,

        contactPerson: row.contactPerson,

        phone: row.phone,

        email: row.email,

        // ✅ Multiple Signatories
        authorizedSignatories: [
          {
            name: row.authorizedSignatoryName,
            role: row.signatoryRole,
            isDefault: true,
          },
        ],

        dateOfIncorporation: row.dateOfIncorporation,

        operatingPeriod: row.operatingPeriod,
      });
    }

    await Company.insertMany(companies);

    res.json({
      msg: "Companies uploaded successfully",
      count: companies.length,
    });
  } catch (error) {
    console.error("Company bulk upload failed", { name: error.name, message: error.message });
    return res.status(500).json({ msg: "Unable to upload companies" });
  }
};

// ================= GET COMPANY BY ID =================

export const getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findOne({
      _id: companyId,
      ...(await getCompanyScope(req.user)),
    });

    if (!company) {
      return res.status(404).json({
        msg: "Company not found",
      });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= UPDATE COMPANY =================

export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    // ✅ Validate only one default signatory
    if (req.body.authorizedSignatories) {
      const defaultCount = req.body.authorizedSignatories.filter(
        (signatory) => signatory.isDefault === true,
      ).length;

      if (defaultCount > 1) {
        return res.status(400).json({
          msg: "Only one authorized signatory can be selected for printing",
        });
      }
    }

    const editableFields = [
      "nameOfCompany",
      "pan",
      "gst",
      "factoryAddress",
      "registeredOfficeAddress",
      "ecNumber",
      "ecDate",
      "udyamNumber",
      "mpcbDetails",
      "contactPerson",
      "phone",
      "email",
      "authorizedSignatories",
      "dateOfIncorporation",
      "operatingPeriodFrom",
      "operatingPeriodTo",
      "operatingPeriod",
    ];
    const updates = Object.fromEntries(
      editableFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]]),
    );
    const updatedCompany = await Company.findOneAndUpdate(
      { _id: companyId, ...(await getCompanyScope(req.user)) },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedCompany) {
      return res.status(404).json({
        msg: "Company not found",
      });
    }

    res.json({
      msg: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        msg: error.name === "ValidationError"
          ? Object.values(error.errors).map((item) => item.message).join("; ")
          : `${error.path} has an invalid value`,
      });
    }
    console.error("Company update failed", { name: error.name, message: error.message });
    return res.status(500).json({ msg: "Unable to update company" });
  }
};

// ================= DELETE COMPANY =================

export const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const deletedCompany = await Company.findOneAndDelete({
      _id: companyId,
      ...(await getCompanyScope(req.user)),
    });

    if (!deletedCompany) {
      return res.status(404).json({
        msg: "Company not found",
      });
    }

    res.json({
      msg: "Company deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};
