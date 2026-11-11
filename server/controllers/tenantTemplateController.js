import GeneratedDocument from "../models/GeneratedDocument.js";

const labels = {
  COVERING_LETTER: "Covering Letter",
  BANK_INTEREST_CERTIFICATE: "Bank Interest Certificate",
  APPENDIX_A: "Appendix A",
  APPENDIX_B: "Appendix B",
  APPENDIX_C: "Appendix C",
  POWER_SUBSIDY: "Power Subsidy",
  INTEREST_SUBSIDY: "Interest Subsidy",
  DISBURSEMENT_AGREEMENT: "Disbursement Agreement",
  AFFIDAVIT: "Affidavit",
  ELP_FORM: "ELP Form",
  PRODUCTION_EXTRACT: "Production Extract",
};
const templates = GeneratedDocument.schema.path("documentType").enumValues.map((documentType) => ({
  id: documentType,
  documentType,
  name: labels[documentType] || documentType,
  source: "shared-generator",
}));

export const listTenantTemplates = (_req, res) => res.json({ success: true, data: templates });

export const getTenantTemplate = (req, res) => {
  const template = templates.find((item) => item.id === req.params.templateId);
  if (!template) return res.status(404).json({ success: false, msg: "Template not found." });
  return res.json({ success: true, data: template });
};
