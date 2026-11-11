import Company from "../models/Company.js";
import Bank from "../models/Bank.js";
import DocumentMaster from "../models/DocumentMaster.js";
import GeneratedDocument from "../models/GeneratedDocument.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import { getOfficeCompanyIds } from "../utils/officeScope.js";

import pdf from "html-pdf-node";

import { generateCoveringWord } from "../templates/generateCoveringWord.js";
import { generatePowerSubsidyWord } from "../templates/generatePowerSubsidyWord.js";
import { generateInterestSubsidyWord } from "../templates/generateInterestSubsidyWord.js";

import { generateAppendixExcel } from "../services/excelService.js";
import { generateBankInterestExcel } from "../services/bankIntrestExcel.js";
import { generateAppendixBExcel } from "../services/appendixBExcel.js";
import { generateAppendixCExcel } from "../services/appendixCExcel.js";
import { generateDisbursementAgreementWord } from "../templates/generateDisbursementAgreementWord.js";
import { generateELPExcel } from "../services/elpExcel.js";
import { generateProductionExcel } from "../services/productionExtractExcel.js";
import { storeDocument, deleteStoredFile, getStoredFilePath } from "../services/serverStorageService.js";
import { saveGeneratedDocument } from "../services/documentService.js";
import { recordTenantActivity } from "./tenantSupportController.js";


import { generateAffidavitWord } from "../templates/generateAffidavitWord.js";


// ================= COVERING LETTER =================

// ================= COVERING WORD =================

export const generateCoveringWordFile = async (req, res) => {
  try {
    const { companyId } = req.params;
    

    console.log("USER:", req.user);

    // ================= AUTH =================
    if (!req.user?.id) {
      return res.status(401).json({
        msg: "Unauthorized user",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // ================= COMPANY =================
    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    const company = await Company.findById(companyObjectId);

    if (!company) {
      return res.status(404).json({
        msg: "Company not found",
      });
    }

    // ================= MASTER DATA =================
    const documentMaster = await DocumentMaster.findOne({
      company: companyObjectId,
      documentType: "COVERING_LETTER",
    });

    const staticData = documentMaster?.staticData || {};

    const mergedData = {
      ...staticData,
      ...req.body,
    };

    // ================= GENERATE FILE =================
    const buffer = await generateCoveringWord(company, mergedData);

    if (!buffer) {
      throw new Error("Covering document generation failed");
    }

    const mimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const fileName = `CoveringLetter-${Date.now()}.docx`;

    // ================= UPLOAD TO S3 =================
    const fileInfo = await storeDocument(
      buffer,
      fileName,
      companyObjectId,
      mimeType,
    );

  

    // ================= SAVE DOCUMENT =================
    const generatedDoc = await GeneratedDocument.create({
      company: companyObjectId,
      
      metadata: mergedData,

      documentType: "COVERING_LETTER",

      fileName,

      fileSize: fileInfo.fileSize,

      mimeType,
      storageType: fileInfo.storageType,
      filePath: fileInfo.filePath,

      maker: userId, // ?? FIXED

      status: "PENDING_CHECK", // ?? DEFAULT TO PENDING_CHECK
    });
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "DOCUMENT_CREATED", resourceType: "GeneratedDocument", resourceId: generatedDoc._id, metadata: { documentType: generatedDoc.documentType, companyId: String(generatedDoc.company) } });

    console.log(
      "? COVERING LETTER SAVED:",
      generatedDoc._id,
      "Maker:",
      generatedDoc.maker,
    );

    // ================= RESPONSE =================
    res.set({
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename=${fileName}`,
    });

    return res.send(buffer);
  } catch (error) {
    console.error("? Error generating covering letter:", error);

    return res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= DISBURSEMENT AGREEMENT =================

export const generateDisbursementAgreement = async (req, res) => {
  try {
    const { companyId } = req.params;
  

    // ================= AUTH =================
    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized user" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // ================= COMPANY =================
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // ================= MASTER =================
    const master = await DocumentMaster.findOne({
      company: companyId,
      documentType: "DISBURSEMENT_AGREEMENT",
    });

    const staticData = master?.staticData || {};

    // ================= MERGE DATA =================
    const mergedData = {
      ...staticData,
      ...req.body,
    };

    // ================= GENERATE FILE =================
    const buffer = await generateDisbursementAgreementWord(mergedData);

    const mimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const fileName = "Disbursement_Agreement.docx";

    // ================= UPLOAD TO S3 =================
    const fileInfo = await storeDocument(
      buffer,
      fileName,
      companyId,
      mimeType,
    );

   
    // ================= SAVE DOCUMENT (STANDARDIZED) =================
    const generatedDoc = await GeneratedDocument.create({
      company: new mongoose.Types.ObjectId(companyId),
      metadata: mergedData,
      documentType: "DISBURSEMENT_AGREEMENT",

      fileName,
      fileSize: fileInfo.fileSize,
      mimeType,
      storageType: fileInfo.storageType,
      filePath: fileInfo.filePath,

      maker: userId, // ?? ALWAYS REQUIRED

      status: "PENDING_CHECK", // ?? DEFAULT TO PENDING_CHECK
    });
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "DOCUMENT_CREATED", resourceType: "GeneratedDocument", resourceId: generatedDoc._id, metadata: { documentType: generatedDoc.documentType, companyId: String(generatedDoc.company) } });

    console.log("? DISBURSEMENT SAVED:", generatedDoc._id);

    // ================= RESPONSE =================
    res.set({
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename=${fileName}`,
    });

    return res.send(buffer);
  } catch (error) {
    console.error("? Disbursement Error:", error);
    return res.status(500).json({ msg: error.message });
  }
};
// ================= GET CLIENTS =================

export const getClients = async (req, res) => {
  try {
    const clients = await User.find({
      role: "client",
    }).select("fname lname email");

    res.json(clients);
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= APPENDIX A =================

export const generateAppendix = async (req, res) => {
  try {
    const { companyId } = req.params;
    

    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized user" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // ================= COMPANY =================
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // ================= BANK =================
    const bank = await Bank.findOne({ company: companyId });

    // ================= GENERATE FILE =================
    // const workbook = await generateAppendixExcel(company, bank, req.body);

    // ?? GET MASTER DATA
    const documentMaster = await DocumentMaster.findOne({
      company: companyId,
      documentType: "APPENDIX_A",
    });

    // ?? MERGE ALL DATA (THIS IS THE KEY FIX)
    const mergedData = {
      ...company.toObject(), // company fields
      ...(documentMaster?.staticData || {}), // static
      ...(req.body || {}), // dynamic
    };

    // ?? PASS ONLY ONE OBJECT
    const workbook = await generateAppendixExcel(mergedData);

    const buffer = await workbook.xlsx.writeBuffer();

    const mimeType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const fileName = "AppendixA.xlsx";

    // ================= UPLOAD =================
    const fileInfo = await storeDocument(
      buffer,
      fileName,
      companyId,
      mimeType,
    );

  
    // ================= ALWAYS SAVE DOCUMENT =================
    const generatedDoc = await GeneratedDocument.create({
      company: companyId,
      metadata: mergedData,
      documentType: "APPENDIX_A",

      fileName,
      fileSize: fileInfo.fileSize,
      mimeType,
      storageType: fileInfo.storageType,
      filePath: fileInfo.filePath,

      maker: userId,

      status: "PENDING_CHECK",
    });
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "DOCUMENT_CREATED", resourceType: "GeneratedDocument", resourceId: generatedDoc._id, metadata: { documentType: generatedDoc.documentType, companyId: String(generatedDoc.company) } });

    console.log("? APPENDIX SAVED:", generatedDoc._id);

    // ================= RESPONSE =================
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    return res.send(buffer);
  } catch (error) {
    console.error("? Error generating appendix A:", error);

    return res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= GET COMPANIES =================

export const getCompaniesByClient = async (req, res) => {
  try {
   

    const companies = await Company.find({
      
    });

    res.json(companies);
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

export const generateDocument = async (req, res) => {
  try {
    const { companyId, documentType } = req.params;
   

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // 1. COMPANY
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // 2. MASTER DATA
    const master = await DocumentMaster.findOne({
      company: companyId,
      documentType,
    });

    const staticData = master?.staticData || {};

    // 3. MERGE DATA
    const mergedData = {
      ...staticData,
      ...req.body,
    };

    // 4. GENERATE FILE (your template function)
    const buffer = await generateTemplate(company, mergedData);

    const mimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const fileName = `${documentType}.docx`;

    // 5. UPLOAD TO S3
    const fileInfo = await storeDocument(
      buffer,
      fileName,
      companyId,
      mimeType,
    );

    // 6. SAVE IN DB (?? ALWAYS SAME WAY)
    const generatedDoc = await saveGeneratedDocument({
      companyId,
      documentType,
      fileName,
      fileInfo,
      userId,
      status: "PENDING_CHECK",
    });
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "DOCUMENT_CREATED", resourceType: "GeneratedDocument", resourceId: generatedDoc._id, metadata: { documentType: generatedDoc.documentType, companyId: String(generatedDoc.company) } });

    // 7. RESPONSE
    res.set({
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename=${fileName}`,
    });

    return res.send(buffer);
  } catch (error) {
    console.error("? Error:", error);
    return res.status(500).json({ msg: error.message });
  }
};
// ================= DOCUMENT MASTER =================

export const generateDocumentFromMaster = async (req, res) => {
  try {
    console.log("?? CONTROLLER HIT");
    console.log("Params:", req.params);
    console.log("Query:", req.query);
    console.log("User:", req.user);

    const { companyId, documentType } = req.params;
    
  

    if (!companyId || !documentType) {
      return res.status(400).json({
        msg: "companyId or documentType missing",

        
      });
    }

    const type = documentType.toUpperCase().trim();

    console.log("?? COMPANY ID:", companyId);
   
    console.log("?? DOCUMENT TYPE:", type);

    // ================= COMPANY =================

    const company = await Company.findById(companyId);
    

    if (!company) {
      
      return res.status(404).json({
        msg: "Company not found",
        
      });
    }
    
    // ================= MASTER =================

    const documentMaster = await DocumentMaster.findOne({
      company: companyId,
      documentType: type,
    });

    console.log("?? FOUND MASTER:", documentMaster);

    // ================= BANK =================

    const bank = await Bank.findOne({
      company: companyId,
    });

    // ================= MERGE DATA =================

    const mergedData = {
      ...company.toObject(),
      ...(documentMaster?.staticData || {}),
      ...(req.body || {}),
    };

    console.log("?? MERGED DATA:", mergedData);

    // ================= HANDLERS =================

    const documentHandlers = {
      COVERING_LETTER: async () => {
        console.log("?? Generating Covering Letter");

        return await generateCoveringWord(company, mergedData);
      },

      BANK_INTEREST_CERTIFICATE: async () => {
        return await generateBankInterestExcel(company, bank, mergedData);
      },

      APPENDIX_A: () => generateAppendixExcel(mergedData),

      // APPENDIX_A: async () => {
      //   return await generateAppendixExcel(company, bank, mergedData);
      // },
      APPENDIX_B: async () => {
        return await generateAppendixBExcel(mergedData);
      },

      APPENDIX_C: async () => {
        return await generateAppendixCExcel(mergedData);
      },

      DISBURSEMENT_AGREEMENT: async () => {
        return await generateDisbursementAgreementWord(mergedData);
      },

      ELP_FORM: async () => {
        return await generateELPExcel(mergedData);
      },

      PRODUCTION_EXTRACT: async () => {
        return await generateProductionExcel(mergedData, mergedData);
      },
    };

    const handler = documentHandlers[type];

    console.log("?? HANDLER EXISTS:", !!handler);

    if (!handler) {
      return res.status(400).json({
        msg: `Invalid document type: ${type}`,
      });
    }

    // ================= GENERATE DOCUMENT =================
    // ================= GENERATE DOCUMENT =================

    const result = await handler();

    console.log("RESULT:", result);
    console.log("RESULT TYPE:", typeof result);
    console.log("HAS XLSX:", !!result?.xlsx);

    let buffer;
    let mimeType;
    let fileExtension;

    // ================= WORD vs EXCEL =================

    if (result instanceof Buffer) {
      console.log("?? WORD DOCUMENT DETECTED");

      buffer = result;

      mimeType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      fileExtension = ".docx";
    } else {
      console.log("?? EXCEL DOCUMENT DETECTED");

      buffer = await result.xlsx.writeBuffer();

      mimeType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      fileExtension = ".xlsx";
    }

    const fileName = `${type}${fileExtension}`;

    // ================= S3 UPLOAD =================

    const fileInfo = await storeDocument(
      buffer,
      fileName,
      companyId,
      mimeType,
    );

    // ================= SAVE DOCUMENT =================

    const userId = new mongoose.Types.ObjectId(req.user.id);

    

    const generatedDoc = new GeneratedDocument({
      company: new mongoose.Types.ObjectId(companyId),

     metadata: mergedData,

      documentType: type,

      fileName,
      fileSize: fileInfo.fileSize,
      mimeType,
      storageType: fileInfo.storageType,
      filePath: fileInfo.filePath,

      maker: userId,

      status: "PENDING_CHECK",
    });

    await generatedDoc.save();
    // ================= RESPONSE =================

    res.setHeader("Content-Type", mimeType);

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    console.log("? Sending file:", fileName);

    return res.send(buffer);
  } catch (error) {
    console.error("? FULL ERROR STACK:");
    console.error(error);
    console.error("? MESSAGE:", error.message);
    console.error("? STACK:", error.stack);

    return res.status(500).json({
      msg: "Document generation failed",
      error: error.message,
    });
  }
};
// ================= POWER SUBSIDY =================

export const generatePowerSubsidyDocument = async (req, res) => {
  try {
    const { companyId } = req.params;
   

    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized user" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // ================= COMPANY =================
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // ================= GENERATE FILE =================
    const buffer = await generatePowerSubsidyWord(company, req.body);

    const mimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const fileName = "PowerSubsidy.docx";

    // ================= UPLOAD =================
    const fileInfo = await storeDocument(
      buffer,
      fileName,
      companyId,
      mimeType,
    );


    // ================= ALWAYS SAVE DOCUMENT =================
    const generatedDoc = await GeneratedDocument.create({
      company: companyId,
      metadata: req.body,
      documentType: "POWER_SUBSIDY",

      fileName,
      fileSize: fileInfo.fileSize,
      mimeType,
      storageType: fileInfo.storageType,
      filePath: fileInfo.filePath,

      maker: userId,

      status: "PENDING_CHECK",
    });
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "DOCUMENT_CREATED", resourceType: "GeneratedDocument", resourceId: generatedDoc._id, metadata: { documentType: generatedDoc.documentType, companyId: String(generatedDoc.company) } });

    console.log("? POWER SUBSIDY SAVED:", generatedDoc._id);

    // ================= RESPONSE =================
    res.set({
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename=${fileName}`,
    });

    return res.send(buffer);
  } catch (error) {
    console.error("? Error generating power subsidy:", error);

    return res.status(500).json({
      msg: error.message,
    });
  }
};
// ================= INTEREST SUBSIDY =================

export const generateInterestSubsidyDocument = async (req, res) => {
  try {
    const { companyId } = req.params;
   

    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized user" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // ================= COMPANY =================
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // ================= BANK =================
    const bank = await Bank.findOne({ company: companyId });

    // ================= GENERATE FILE =================
    const buffer = await generateInterestSubsidyWord(company, bank, req.body);

    const mimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const fileName = "InterestSubsidy.docx";

    // ================= UPLOAD =================
    const fileInfo = await storeDocument(
      buffer,
      fileName,
      companyId,
      mimeType,
    );


    // ================= ALWAYS SAVE DOCUMENT =================
    const generatedDoc = await GeneratedDocument.create({
      company: companyId,
metadata: req.body,
      documentType: "INTEREST_SUBSIDY",

      fileName,
      fileSize: fileInfo.fileSize,
      mimeType,
      storageType: fileInfo.storageType,
      filePath: fileInfo.filePath,

      maker: userId,

      status: "PENDING_CHECK",
    });
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "DOCUMENT_CREATED", resourceType: "GeneratedDocument", resourceId: generatedDoc._id, metadata: { documentType: generatedDoc.documentType, companyId: String(generatedDoc.company) } });

    console.log("? INTEREST SUBSIDY SAVED:", generatedDoc._id);

    // ================= RESPONSE =================
    res.set({
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename=${fileName}`,
    });

    return res.send(buffer);
  } catch (error) {
    console.error("? Error generating interest subsidy:", error);

    return res.status(500).json({
      msg: error.message,
    });
  }
};
export const generateAffidavit = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Load static data

    const master = await DocumentMaster.findOne({
      company: companyId,
      documentType: "AFFIDAVIT",
    });

    const staticData = master?.staticData || {};

    // Merge static + dynamic

    const finalData = {
      ...staticData,
      ...req.body,
    };

    const buffer = await generateAffidavitWord(finalData);

    res.setHeader("Content-Disposition", "attachment; filename=Affidavit.docx");
    

   
      const fileInfo = await storeDocument(
        buffer,
        "Affidavit.docx",
        companyId,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );

      const generatedDoc = new GeneratedDocument({
        company: companyId,
        metadata: finalData,
        
        documentType: "AFFIDAVIT",
        fileName: "Affidavit.docx",
        fileSize: fileInfo.fileSize,
        mimeType: fileInfo.mimeType,
      storageType: fileInfo.storageType,
      filePath: fileInfo.filePath,
        maker: req.user?.id,
      });

      await generatedDoc.save();

      console.log("? AFFIDAVIT SAVED:", generatedDoc._id);
    

    res.send(buffer);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Failed to generate Affidavit",
    });
  }
};

export const generateProductionExtract = async (req, res) => {
  try {
    const { companyId } = req.params;
    const data = req.body;

    // ================= AUTH =================
    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized user" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    console.log("?? Params:", req.params);

    // ================= COMPANY =================
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // ================= MASTER =================
    const master = await DocumentMaster.findOne({
      company: companyId,
      documentType: "PRODUCTION_EXTRACT",
    });

    const safeMaster = master || {
      staticData: {},
    };

    console.log("?? Master Found:", master);

    const workbook = await generateProductionExcel(data, safeMaster);

    const staticData = master?.staticData || {};

    // console.log("?? Master Found:", master);

    // ================= GENERATE WORKBOOK =================
    // const workbook = await generateProductionExcel(data, master);

    const buffer = await workbook.xlsx.writeBuffer();

    const mimeType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const fileName = "ProductionExtract.xlsx";

    // ================= UPLOAD =================
    const fileInfo = await storeDocument(
      buffer,
      fileName,
      companyId,
      mimeType,
    );

 

    // ================= SAVE DOCUMENT (MANDATORY FIX) =================
    const generatedDoc = await GeneratedDocument.create({
      company: companyId,
      metadata: req.body,
      documentType: "PRODUCTION_EXTRACT",

      fileName,
      fileSize: fileInfo.fileSize,
      mimeType,
      storageType: fileInfo.storageType,
      filePath: fileInfo.filePath,

      maker: userId, // ?? THIS FIXES YOUR ASSIGN CHECKER ISSUE

      status: "PENDING_CHECK",
    });
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "DOCUMENT_CREATED", resourceType: "GeneratedDocument", resourceId: generatedDoc._id, metadata: { documentType: generatedDoc.documentType, companyId: String(generatedDoc.company) } });

    console.log("? SAVED DOC:", generatedDoc._id);

    // ================= RESPONSE =================
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    return res.send(buffer);
  } catch (error) {
    console.error("? Production Extract Error:", error);

    return res.status(500).json({
      msg: "Error generating document",
      error: error.message,
    });
  }
};
export const getGeneratedDocumentsByClient = async (req, res) => {
  try {
    const companyIds = await getOfficeCompanyIds(req.user);
    const query = companyIds === null ? {} : { company: { $in: companyIds } };
    const documents = await GeneratedDocument.find(query)
      .select("-filePath -s3Key -s3Url -s3Bucket")
      .populate("company", "nameOfCompany")
      .populate("maker", "fname lname permissions")
      .populate("checker", "fname lname")
      .populate("approver", "fname lname")
      .sort({ uploadedAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};


export const getGeneratedDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await GeneratedDocument.findById(documentId)
      .select("-filePath -s3Key -s3Url -s3Bucket")
      .populate("company")
      .populate("maker", "fname lname")
      .populate("checker", "fname lname")
      .populate("approver", "fname lname");

    if (!document) {
      return res.status(404).json({
        msg: "Document not found",
      });
    }

    res.json(document);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: error.message,
    });
  }
};


export const getGeneratedDocumentFile = async (req, res) => {
  try {
    const document = req.officeDocument?._id
      ? await GeneratedDocument.findById(req.officeDocument._id)
      : await GeneratedDocument.findById(req.params.documentId);
    if (!document) return res.status(404).json({ msg: "Document not found" });
    const permissions = req.user?.permissions || [];
    const userId = String(req.user?.id || "");
    const tenantAdminApprovedDocument =
      req.user?.role === "admin" &&
      Boolean(req.user?.tenantId) &&
      document.status === "APPROVED" &&
      Boolean(req.officeDocument?._id);
    const permitted = permissions.includes("superadmin") || tenantAdminApprovedDocument || [document.maker, document.checker, document.approver].some((owner) => String(owner || "") === userId);
    if (!permitted) return res.status(403).json({ msg: "Not authorized to access this document" });
    if (document.storageType !== "filesystem" || !document.filePath) return res.status(410).json({ msg: "Legacy S3 document is not stored on this server. Migrate it from an authorized backup first." });
    const safeName = String(document.fileName || "document").replace(/[\r\n\"]+/g, "_");
    return res.type(document.mimeType || "application/octet-stream").set("Content-Disposition", `inline; filename="${safeName}"`).sendFile(getStoredFilePath(document.filePath), (error) => {
      if (error && !res.headersSent) res.status(error.statusCode === 404 ? 404 : 500).json({ msg: error.statusCode === 404 ? "Stored file is missing" : "Unable to read stored file" });
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const createTenantGeneratedDocument = async (req, res) => {
  try {
    const { companyId, documentType, data = {} } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(companyId)) return res.status(400).json({ success: false, msg: "Valid companyId is required." });
    if (!GeneratedDocument.schema.path("documentType").enumValues.includes(documentType)) return res.status(400).json({ success: false, msg: "Unsupported document type." });
    if (!data || typeof data !== "object" || Array.isArray(data)) return res.status(400).json({ success: false, msg: "Document data must be an object." });

    const company = await Company.findOne({ _id: companyId, ...(await getCompanyScope(req.user)) });
    if (!company) return res.status(404).json({ success: false, msg: "Company not found in this tenant." });
    const master = await DocumentMaster.findOne({ company: company._id, documentType }).select("staticData prefillData").lean();
    const mergedData = { ...(master?.staticData || {}), ...(master?.prefillData || {}), ...data };
    const bank = ["BANK_INTEREST_CERTIFICATE", "INTEREST_SUBSIDY", "APPENDIX_A", "APPENDIX_B", "APPENDIX_C"].includes(documentType)
      ? await Bank.findOne({ company: company._id })
      : null;
    let buffer;
    let mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    switch (documentType) {
      case "COVERING_LETTER": buffer = await generateCoveringWord(company, mergedData); break;
      case "BANK_INTEREST_CERTIFICATE": buffer = await (await generateBankInterestExcel(company, bank, mergedData)).xlsx.writeBuffer(); mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; break;
      case "APPENDIX_A": buffer = await (await generateAppendixExcel(mergedData)).xlsx.writeBuffer(); mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; break;
      case "APPENDIX_B": buffer = await (await generateAppendixBExcel(mergedData)).xlsx.writeBuffer(); mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; break;
      case "APPENDIX_C": buffer = await (await generateAppendixCExcel(mergedData)).xlsx.writeBuffer(); mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; break;
      case "POWER_SUBSIDY": buffer = await generatePowerSubsidyWord(company, mergedData); break;
      case "INTEREST_SUBSIDY": buffer = await generateInterestSubsidyWord(company, bank, mergedData); break;
      case "DISBURSEMENT_AGREEMENT": buffer = await generateDisbursementAgreementWord(mergedData); break;
      case "AFFIDAVIT": buffer = await generateAffidavitWord(mergedData); break;
      case "ELP_FORM": buffer = await (await generateELPExcel(company, mergedData)).xlsx.writeBuffer(); mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; break;
      case "PRODUCTION_EXTRACT": buffer = await (await generateProductionExcel(mergedData)).xlsx.writeBuffer(); mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; break;
      default: return res.status(400).json({ success: false, msg: "Unsupported document type." });
    }
    if (!buffer) throw new Error("The document generator returned no file.");
    const extension = mimeType.includes("spreadsheetml") ? "xlsx" : "docx";
    const fileName = `${documentType}-${Date.now()}.${extension}`;
    const fileInfo = await storeDocument(buffer, fileName, company._id, mimeType);
    const document = await GeneratedDocument.create({
      company: company._id,
      client: company.client,
      documentType,
      fileName,
      fileSize: fileInfo.fileSize,
      mimeType,
      storageType: fileInfo.storageType,
      filePath: fileInfo.filePath,
      ...(fileInfo.s3Key ? { s3Key: fileInfo.s3Key } : {}),
      maker: req.user.id,
      metadata: mergedData,
      status: "PENDING_CHECK",
    });
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "DOCUMENT_CREATED", resourceType: "GeneratedDocument", resourceId: document._id, metadata: { documentType, companyId: String(company._id) } });
    return res.status(201).json({
      success: true,
      msg: "Document generated and submitted for checking.",
      data: { _id: document._id, company: document.company, documentType: document.documentType, fileName: document.fileName, status: document.status, createdAt: document.createdAt },
    });
  } catch (error) {
    console.error("Tenant document generation failed:", error);
    if (["ValidationError", "CastError"].includes(error.name)) return res.status(400).json({ success: false, msg: "Document details are invalid." });
    return res.status(500).json({ success: false, msg: "Document generation failed." });
  }
};
// ================= ELP FORM =================
export const generateELPForm = async (req, res) => {
  try {
    console.log("?? BACKEND ELP CONTROLLER HIT");
    const { companyId } = req.params;

    const formData = req.body;

    // ================= AUTH =================

    if (!req.user?.id) {
      return res.status(401).json({
        msg: "Unauthorized user",
      });
    }

    if (!companyId) {
      return res.status(400).json({
        msg: "companyId missing",
      });
    }

    // ================= COMPANY =================

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        msg: "Company not found",
      });
    }

    // ================= MASTER =================

    const master = await DocumentMaster.findOne({
      company: companyId,
      documentType: "ELP_FORM",
    });

    const staticData = master?.staticData || {};

    // ================= MERGE =================

    const mergedData = {
      ...staticData,
      ...formData,
    };

    // ================= GENERATE EXCEL =================
    // ?? FIXED — PASS BOTH company AND mergedData

    const workbook = await generateELPExcel(company, mergedData);

    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = "ELP.xlsx";

    const mimeType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    // ================= UPLOAD =================

    const fileInfo = await storeDocument(
      buffer,
      fileName,
      companyId,
      mimeType,
    );

    // ================= SAVE =================


    const generatedDoc = await GeneratedDocument.create({
  company: companyId,
  metadata: mergedData,

  documentType: "ELP_FORM",

  fileName,
  fileSize: fileInfo.fileSize,
  mimeType,
      storageType: fileInfo.storageType,
      filePath: fileInfo.filePath,

  maker: new mongoose.Types.ObjectId(req.user.id),

  status: "PENDING_CHECK",
});
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "DOCUMENT_CREATED", resourceType: "GeneratedDocument", resourceId: generatedDoc._id, metadata: { documentType: generatedDoc.documentType, companyId: String(generatedDoc.company) } });

    // ================= RESPONSE =================

    res.setHeader("Content-Type", mimeType);

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    return res.send(buffer);
  } catch (error) {
    console.error("? FULL ELP ERROR:");
console.error(error);
console.error(error.message);
console.error(error.stack);

    return res.status(500).json({
      msg: error.message,
    });
  }
};
// ================= DELETE GENERATED DOCUMENT =================

export const deleteGeneratedDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Document ID is required",
      });
    }

    const document = await GeneratedDocument.findById(id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }
    const permissions = req.user?.permissions || [];
    const canDelete = permissions.includes("superadmin") || String(document.maker) === String(req.user?.id);
    if (!canDelete) return res.status(403).json({ message: "Not authorized to delete this document" });
    if (document.storageType === 'filesystem' && document.filePath) {
      await deleteStoredFile(document.filePath);
    }

    // ?? DELETE FROM DATABASE
    await GeneratedDocument.findByIdAndDelete(id);

    res.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete Document Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================================

export const editGeneratedDocument = async (req, res) => {
  let replacementPath;
  try {
    const { documentId } = req.params;

    // ================= FIND DOCUMENT =================

    const document = await GeneratedDocument.findById(documentId);

    if (!document) {
      return res.status(404).json({
        msg: "Document not found",
      });
    }

    // ================= ALLOW ONLY REJECTED =================

    if (document.status !== "REJECTED_BY_CHECKER") {
      return res.status(400).json({
        msg: "Only rejected documents can be edited",
      });
    }

    // ================= PERMISSIONS =================

    const permissions = req.user.permissions || [];

    const isMaker =
      permissions.includes("maker") &&
      document.maker.toString() === req.user.id;


      const isChecker =
  permissions.includes("checker") &&
  document.checker?.toString() === req.user.id;

    if (!isMaker && !isChecker) {
      return res.status(403).json({
        msg: "Not authorized to edit",
      });
    }

    // ================= OLD FILE INFO =================

    const oldFileName = document.fileName;

    const oldFilePath = document.filePath;
    const oldStorageType = document.storageType;

    // ================= MERGE DATA =================

    const mergedData = {
      ...(document.metadata || {}),
      ...(req.body || {}),
    };

    // ================= COMPANY =================

    const company = await Company.findById(
      document.company
    );

    if (!company) {
      return res.status(404).json({
        msg: "Company not found",
      });
    }

    // ================= BANK =================

    const bank = await Bank.findOne({
      company: document.company,
    });

    let buffer;

    let mimeType = document.mimeType;

    // ================= GENERATE DOCUMENT =================

    switch (document.documentType) {
      case "COVERING_LETTER":
        buffer = await generateCoveringWord(
          company,
          mergedData
        );
        break;

      case "DISBURSEMENT_AGREEMENT":
        buffer =
          await generateDisbursementAgreementWord(
            mergedData
          );
        break;

      case "POWER_SUBSIDY":
        buffer =
          await generatePowerSubsidyWord(
            company,
            mergedData
          );
        break;

      case "INTEREST_SUBSIDY":
        buffer =
          await generateInterestSubsidyWord(
            company,
            bank,
            mergedData
          );
        break;

      case "AFFIDAVIT":
        buffer = await generateAffidavitWord(
          mergedData
        );
        break;

      case "APPENDIX_A": {
        const workbook =
          await generateAppendixExcel(
            mergedData
          );

        buffer =
          await workbook.xlsx.writeBuffer();

        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        break;
      }
 
      
      case "APPENDIX_B": {
        const workbook =
          await generateAppendixBExcel(
            mergedData
          );

        buffer =
          await workbook.xlsx.writeBuffer();

        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        break;
      }
case "BANK_INTEREST_CERTIFICATE": {
  console.log("BANK CASE HIT");

  const workbook =
    await generateBankInterestExcel(
      company,
      bank,
      mergedData
    );

  console.log("WORKBOOK CREATED");

  buffer =
    await workbook.xlsx.writeBuffer();

  console.log("BUFFER CREATED");

  mimeType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  break;
}
      case "APPENDIX_C": {
        const workbook =
          await generateAppendixCExcel(
            mergedData
          );

        buffer =
          await workbook.xlsx.writeBuffer();

        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        break;
      }

      case "ELP_FORM": {
        const workbook =
          await generateELPExcel(
            company,
            mergedData
          );

        buffer =
          await workbook.xlsx.writeBuffer();

        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        break;
      }

      case "PRODUCTION_EXTRACT": {
        const workbook =
          await generateProductionExcel(
            mergedData,
            
          );

        buffer =
          await workbook.xlsx.writeBuffer();

        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        break;
      }

      default:
        return res.status(400).json({
          msg: "Unsupported document type",
        });
    }

    // ================= NEW FILE NAME =================
const originalFileName =
  document.fileName.replace(/^V\d+-/, "");

const fileName = `V${
  document.version + 1
}-${originalFileName}`;

    // ================= UPLOAD NEW FILE =================

    const fileInfo = await storeDocument(
      buffer,
      fileName,
      document.company,
      mimeType
    );
    replacementPath = fileInfo.filePath;

    // ================= UPDATE SAME DOCUMENT =================

    document.metadata = mergedData;

    document.fileName = fileName;

    document.fileSize = fileInfo.fileSize;

    document.mimeType = mimeType;

    document.storageType = fileInfo.storageType;
    document.filePath = fileInfo.filePath;

    

    

    // ================= RESET WORKFLOW =================

    document.status = "PENDING_CHECK";

    document.checkedAt = null;

    document.approvedAt = null;

    document.rejectedReason = "";

    // ================= VERSION =================

    document.version += 1;

    // ================= EDIT LOG =================

    document.editLogs.push({
  editedBy: req.user.id,

  editedRole: isMaker
    ? "maker"
    : "checker",

  previousStatus:
    "REJECTED_BY_CHECKER",

  newStatus: "PENDING_CHECK",

  previousFileName: oldFileName,

  newFileName: fileName,

  previousFilePath: oldFilePath,

  newFilePath: fileInfo.filePath,

  comment:
    req.body.comment ||
    "Document edited",
});
    // ================= SAVE =================

    await document.save();
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "DOCUMENT_EDITED", resourceType: "GeneratedDocument", resourceId: document._id, metadata: { version: document.version, status: document.status } });
    if (oldStorageType === "filesystem" && oldFilePath && oldFilePath !== replacementPath) {
      await deleteStoredFile(oldFilePath).catch((cleanupError) => console.error("Old document cleanup failed:", cleanupError.message));
    }
    return res.json({
      msg: "Document edited successfully",
      document: {
        _id: document._id,
        company: document.company,
        documentType: document.documentType,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        status: document.status,
        maker: document.maker,
        checker: document.checker,
        approver: document.approver,
        version: document.version,
        editLogs: document.editLogs,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    if (replacementPath) await deleteStoredFile(replacementPath).catch(() => {});
    console.error(
      "? Edit Document Error:",
      error
    );

    return res.status(500).json({
      msg: error.message,
    });
  }
};


// ================= CHECKER ACTION =================
// ================= CHECKER ACTION =================

export const checkerAction = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { action, reason } = req.body;
    if (!["approve", "reject"].includes(action)) return res.status(400).json({ msg: "Action must be approve or reject." });
    if (action === "reject" && !String(reason || "").trim()) return res.status(400).json({ msg: "A rejection reason is required." });

    const document = await GeneratedDocument.findById(documentId);

    if (!document) {
      return res.status(404).json({
        msg: "Document not found",
      });
    }

    // Prevent double checking
    if (document.status !== "PENDING_CHECK") {
      return res.status(400).json({
        msg: "Document already processed",
      });
    }
    if (String(document.maker) === String(req.user.id)) return res.status(403).json({ msg: "Makers cannot check their own documents." });

    // Save checker name
    document.checker = req.user.id;

    if (action === "approve") {
      document.status = "PENDING_APPROVAL";

      document.checkedAt = new Date();
    }

    if (action === "reject") {
      document.status = "REJECTED_BY_CHECKER";

      document.rejectedReason = reason;

      document.checkedAt = new Date();
    }

    await document.save();

    res.json({
      msg: "Checker action completed",
      document,
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= APPROVER ACTION =================

// ================= APPROVER ACTION =================

export const approverAction = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { action, reason } = req.body;
    if (!["approve", "reject"].includes(action)) return res.status(400).json({ msg: "Action must be approve or reject." });
    if (action === "reject" && !String(reason || "").trim()) return res.status(400).json({ msg: "A rejection reason is required." });

    const document = await GeneratedDocument.findById(documentId);

    if (!document) {
      return res.status(404).json({
        msg: "Document not found",
      });
    }

    // Prevent double approval
    if (document.status !== "PENDING_APPROVAL") {
      return res.status(400).json({
        msg: "Document already processed",
      });
    }
    if (String(document.maker) === String(req.user.id)) return res.status(403).json({ msg: "Makers cannot approve their own documents." });

    // Save approver name
    document.approver = req.user.id;

    if (action === "approve") {
      document.status = "APPROVED";

      document.approvedAt = new Date();
    }

    if (action === "reject") {
      document.status = "REJECTED_BY_APPROVER";

      document.rejectedReason = String(reason).trim();
    }

    await document.save();
    const savedDoc = await GeneratedDocument.findById(
  document._id
);

console.log(
  "SAVED VERSION:",
  savedDoc.version
);

console.log(
  "SAVED METADATA:",
  savedDoc.metadata
);

    res.json({
      msg: "Approver action completed",
      document,
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= ASSIGN CHECKER =================
// ================= ASSIGN APPROVER =================

export const assignApprover = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { approverId } = req.body;

    const document = await GeneratedDocument.findById(documentId);

    if (!document) {
      return res.status(404).json({
        msg: "Document not found",
      });
    }

    // Only checker allowed
    if (String(document.checker || "") !== String(req.user.id)) {
      return res.status(403).json({
        msg: "Not authorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(approverId)) return res.status(400).json({ msg: "Invalid approverId" });
    const approver = await User.findOne({
      _id: approverId,
      permissions: "approver",
      isActive: true,
      ...(req.user.tenantId ? { tenantId: req.user.tenantId } : {}),
    }).select("_id");
    if (!approver) return res.status(400).json({ msg: "Select an active approver from your tenant." });

    document.approver = approver._id;
    document.status = "PENDING_APPROVAL";

    await document.save();

    res.json({
      msg: "Approver assigned successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

export const assignChecker = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { checkerId } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const document = await GeneratedDocument.findById(documentId);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    // ?? FIX 1: maker fallback safety
    if (!document.maker) {
      return res.status(400).json({
        msg: "Document missing maker. Regenerate document.",
      });
    }

    // ?? FIX 2: safer comparison
    if (document.maker.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        msg: "Only maker can assign checker",
      });
    }

    // ?? FIX 3: validate checkerId
    if (!mongoose.Types.ObjectId.isValid(checkerId)) {
      return res.status(400).json({ msg: "Invalid checkerId" });
    }

    const checker = await User.findOne({
      _id: checkerId,
      permissions: "checker",
      isActive: true,
      ...(req.user.tenantId ? { tenantId: req.user.tenantId } : {}),
    }).select("_id");
    if (!checker) return res.status(400).json({ msg: "Select an active checker from your tenant." });

    document.checker = checker._id;
    document.status = "PENDING_CHECK";

    await document.save();

    return res.json({
      msg: "Checker assigned successfully",
      document,
    });
  } catch (error) {
    console.error("assignChecker error:", error);
    return res.status(500).json({ msg: error.message });
  }
};
// ================= GET DOCUMENTS FOR USER =================

export const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await GeneratedDocument.find({
      $or: [{ maker: userId }, { checker: userId }, { approver: userId }],
    })
      .populate("company", "nameOfCompany")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= GET CHECKER LIST =================

export const getCheckerList = async (req, res) => {
  try {
    const checkers = await User.find({
      permissions: "checker",
      isActive: true,
    }).select("_id fname lname email");

    res.json(checkers);
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= GET APPROVER LIST =================

export const getApproverList = async (req, res) => {
  try {
    const approvers = await User.find({
      permissions: "approver",
      isActive: true,
    }).select("_id fname lname email");

    res.json(approvers);
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= GET DOCUMENTS FOR CURRENT USER =================

export const getApprovalDocuments = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        msg: "Unauthorized user",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const permissions = req.user.permissions || [];

    let conditions = [];

    // ================= SUPERADMIN =================

    if (permissions.includes("superadmin")) {
      conditions = [{}];
    }

    // ================= MAKER =================

    if (permissions.includes("maker")) {
      conditions.push({
        maker: userId,
      });
    }

    // ================= CHECKER =================

    if (permissions.includes("checker")) {
      conditions.push({
        status: "PENDING_CHECK",
      });

      // also show checked/rejected docs done by himself
      conditions.push({
        checker: userId,
      });
    }

    // ================= APPROVER =================

    if (permissions.includes("approver")) {
      conditions.push({
        status: "PENDING_APPROVAL",
      });

      // also show approved/rejected docs done by himself
      conditions.push({
        approver: userId,
      });
    }

    const documents = await GeneratedDocument.find({
      $or: conditions,
    })
      .populate("company", "nameOfCompany")
      .populate("maker", "fname lname permissions")
      .populate("checker", "fname lname")
      .populate("approver", "fname lname")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: "Failed to fetch documents",
    });
  }
};

