import DocumentMaster from "../models/DocumentMaster.js";
import Company from "../models/Company.js";
import Bank from "../models/Bank.js";

// ======================================================
// SAVE / UPDATE DOCUMENT MASTER
// ======================================================

export const saveDocumentMaster = async (req, res) => {
  try {
    const { companyId, bankId, documentType, staticData } = req.body;

    // ================= VALIDATION =================

    if (!companyId || !documentType) {
      return res.status(400).json({
        msg: "companyId and documentType are required",
      });
    }

    // ================= CHECK COMPANY =================

    const companyExists = await Company.findById(companyId);

    if (!companyExists) {
      return res.status(404).json({
        msg: "Company not found",
      });
    }

    // ================= CHECK BANK (OPTIONAL) =================

    if (bankId) {
      const bankExists = await Bank.findById(bankId);

      if (!bankExists) {
        return res.status(404).json({
          msg: "Bank not found",
        });
      }
    }

    // ================= FIND EXISTING =================

    let doc = await DocumentMaster.findOne({
      company: companyId,
      documentType,
    });

    // ================= UPDATE =================

    if (doc) {
      doc.staticData = staticData || {};

      doc.bank = bankId || null;

      await doc.save();

      return res.json({
        msg: "Document Master updated successfully",
        doc,
      });
    }

    // ================= CREATE NEW =================

    doc = await DocumentMaster.create({
      company: companyId,
      bank: bankId || null,
      documentType,
      staticData: staticData || {},
    });

    res.json({
      msg: "Document Master created successfully",
      doc,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: error.message,
    });
  }
};

// ======================================================
// GET DOCUMENT MASTER
// ======================================================

export const getDocumentMaster = async (req, res) => {
  try {
    const { companyId, documentType } = req.params;

    // ================= VALIDATION =================

    if (!companyId || !documentType) {
      return res.status(400).json({
        msg: "companyId and documentType are required",
      });
    }

    // ================= FETCH COMPANY =================

    const company = await Company.findById(companyId).lean();

    if (!company) {
      return res.status(404).json({
        msg: "Company not found",
      });
    }

    // ================= FETCH BANK =================

    const bank = await Bank.findOne({
      company: companyId,
    }).lean();

    // ================= FETCH DOCUMENT MASTER =================

    const doc = await DocumentMaster.findOne({
      company: companyId,
      documentType,
    }).lean();

    const staticData = doc?.staticData || {};

    // ======================================================
    // COMPANY MAPPING
    // ======================================================

    const defaultSignatory = company.authorizedSignatories?.find(
      (s) => s.isDefault,
    );

    const companyMapped = {
      // COMPANY
      nameOfCompany: company.nameOfCompany || "",

      factoryAddress: company.factoryAddress || "",

      factoryUnitAddress: company.factoryAddress || "",

      registeredOfficeAddress: company.registeredOfficeAddress || "",

      contactNumber: company.phone || "",

      // ✅ AFFIDAVIT SIGNATORY

      directorName:
        staticData.directorName ||
        staticData.authorizedSignatory ||
        defaultSignatory?.name ||
        "",

      directorRole:
        staticData.directorRole ||
        staticData.authorizedSignatoryRole ||
        defaultSignatory?.role ||
        "",

      directorResidentialAddress: company.registeredOfficeAddress || "",

      ecNumber: company.ecNumber || "",

      ecDate: company.ecDate || "",

      gstRegistrationNumber: company.gst || "",

      mpcbConsentNumber: company.mpcbDetails || "",

      commencementOfProductionDate: company.dateOfIncorporation || "",

      organizationType: company.signatoryRole || "",

      place: "",
    };
    // ======================================================
    // BANK MAPPING
    // ======================================================

    const bankMapped = {
      bankName: bank?.bankName || "",

      accountNumber: bank?.accountNumber || "",

      ifsc: bank?.ifsc || "",

      bankCity: bank?.bankCity || "",

      bankAddress: bank?.bankAddress || "",

      bankState: bank?.bankState || "",

      loanSanctionAmount: "",
    };

    // ======================================================
    // FINAL MERGE
    // ======================================================

    const mergedData = {
      ...companyMapped,
      ...bankMapped,
      ...staticData,

      // ✅ FORCE AFFIDAVIT SIGNATORY VALUES
      directorName:
        staticData.directorName ||
        staticData.authorizedSignatory ||
        companyMapped.directorName ||
        "",

      directorRole:
        staticData.directorRole ||
        staticData.authorizedSignatoryRole ||
        companyMapped.directorRole ||
        "",
    };
    // ======================================================
    // RESPONSE
    // ======================================================

    res.json({
      staticData: mergedData,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: error.message,
    });
  }
};

// ======================================================
// GET ALL DOCUMENTS OF COMPANY
// ======================================================

export const getAllCompanyDocuments = async (req, res) => {
  try {
    const { companyId } = req.params;

    const docs = await DocumentMaster.find({
      company: companyId,
    })
      .populate("company")
      .populate("bank")
      .sort({ createdAt: -1 });

    res.json(docs);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: error.message,
    });
  }
};

// ======================================================
// DELETE DOCUMENT MASTER
// ======================================================

export const deleteDocumentMaster = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await DocumentMaster.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        msg: "Document Master not found",
      });
    }

    res.json({
      msg: "Document Master deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: error.message,
    });
  }
};
