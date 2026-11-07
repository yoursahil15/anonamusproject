import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateAppendixExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();

  const filePath = path.join(__dirname, "..", "templates", "Appendix - A.xlsx");

  console.log(`📄 Loading template: ${filePath}`);

  try {
    await workbook.xlsx.readFile(filePath);
  } catch (error) {
    console.error(`❌ Failed to read template: ${error.message}`);
    throw new Error(`Template file not found: ${filePath}`);
  }

  const sheet = workbook.getWorksheet("Sheet1");
  sheet.getColumn("H").width = 25; // 🔥 MUST ADD
  // ================= HELPERS =================

  const safe = (v) => {
    if (v === null || v === undefined) return "";
    if (typeof v === "string") return v.trim();
    return v;
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1,
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const num = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "string" && v.trim() === "") return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  console.log("📦 FINAL DATA RECEIVED:", data);

  // =====================================================
  // 🔵 STATIC DATA
  // =====================================================
  sheet.getCell("G11").value = safe(data.nameOfCompany);
  sheet.getCell("G13").value = safe(data.factoryAddress);
  sheet.getCell("G15").value = safe(data.place);

  sheet.getCell("G17").value =
    `${safe(data.ecNumber)} dated ${formatDate(data.ecDate)}`;

  sheet.getCell("G66").value = safe(data.authorizedSignatory) || "";
  sheet.getCell("G67").value = safe(data.authorizedSignatoryRole) || "";

  // =====================================================
  // 🟡 HEADER
  // =====================================================
  sheet.getCell("G7").value = safe(data.applicationNumber);
  sheet.getCell("G9").value = safe(data.dateOfReceipt);

  // =====================================================
  // 🟡 FCI (FIXED DISPLAY)
  // =====================================================
  const land = num(data.fciLand);
  const building = num(data.fciBuilding);
  const machinery = num(data.fciMachinery);
  const preop = num(data.fciPreoperative);
  const creditors = num(data.fciCreditors);

  const totalFCI = land + building + machinery + preop + creditors;

  // helper to set number with format
  const setNumber = (cell, value) => {
    const c = sheet.getCell(cell);
    c.value = value;
    c.numFmt = "0.00"; // 👈 IMPORTANT
  };

  setNumber("H22", land);
  setNumber("H23", building);
  setNumber("H24", machinery);
  setNumber("H25", preop);
  setNumber("H26", creditors);
  setNumber("H27", totalFCI);
  // =====================================================
  // 🟡 SCHEME
  // =====================================================
  sheet.getCell("G29").value = safe(data.techUpgradation) || "Not Applicable";
  sheet.getCell("G31").value =
    safe(data.qualityCertification) || "Not Applicable";
  sheet.getCell("G33").value = safe(data.cleanerProduction) || "Not Applicable";
  sheet.getCell("G35").value =
    safe(data.patentRegistration) || "Not Applicable";
  sheet.getCell("G37").value = safe(data.waterAudit) || "Not Applicable";
  sheet.getCell("G39").value = safe(data.energyAudit) || "Not Applicable";
  sheet.getCell("G41").value = safe(data.waterConservation) || "Not Applicable";
  sheet.getCell("G43").value = safe(data.energyEfficiency) || "Not Applicable";
  sheet.getCell("G45").value = safe(data.creditRating) || "Not Applicable";

  // =====================================================
  // 🟡 SUMMARY
  // =====================================================
  sheet.getCell("G47").value =
    `Total Units Consumed: ${safe(data.totalUnitsConsumed)}\n` +
    `Total Eligible Subsidy: ${safe(data.totalEligibleSubsidy)}`;

  sheet.getCell("G49").value =
    `Total Interest Amount: ${safe(data.totalInterestAmount)}\n` +
    `Interest Rate: ${safe(data.interestRate)}`;

  // =====================================================
  // 🔵 FOOTER
  // =====================================================
  // =====================================================
  // 🔵 FOOTER (FIXED FORMAT)
  // =====================================================

  sheet.getCell("B66").value = `Place: ${safe(data.place)}`;
  sheet.getCell("B67").value = `Date: ${formatDate(data.date)}`;

  return workbook;
};
