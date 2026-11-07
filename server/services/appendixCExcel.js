import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateAppendixCExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();

  const filePath = path.join(
    __dirname,
    "..",
    "templates",
    "6. Appendix - C.xlsx",
  );

  console.log(`📄 Loading template: ${filePath}`);

  try {
    await workbook.xlsx.readFile(filePath);
  } catch (error) {
    console.error(`❌ Failed to read template: ${error.message}`);
    throw new Error(`Template file not found or cannot be read: ${filePath}`);
  }

  const sheet = workbook.getWorksheet("Form") || workbook.getWorksheet(1);
  // FIX SERIAL NUMBER ALIGNMENT
  ["B23", "B28"].forEach((ref) => {
    const cell = sheet.getCell(ref);

    cell.alignment = {
      vertical: "top",
      horizontal: "center",
      wrapText: true,
    };
  });

  if (!sheet) throw new Error("Sheet not found");

  // ===============================
  // 🔥 HELPER (MERGED SAFE CELL)
  // ===============================
  const getCell = (ref) => {
    const c = sheet.getCell(ref);
    return c.isMerged ? c.master : c;
  };

  // ===============================
  // 🔹 COMMON SETTER (NO FONT OVERRIDE)
  // ===============================
  const set = (ref, value) => {
    const c = getCell(ref);
    c.value = value ?? "";
    c.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
  };

  // ===============================
  // 🔹 FORMATTERS
  // ===============================
  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) return "";

    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1,
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatPeriod = (p) => {
    if (!p) return "";
    return `From ${formatDate(p.from)} to ${formatDate(p.to)}`;
  };

  // ===============================
  // 🔥 UNIT NAME (ONLY CUSTOM STYLE)
  // ===============================
  const d4 = getCell("D4");
  d4.value = data.unitName || "";
  d4.font = {
    name: "Times New Roman",
    size: 16,
    bold: true,
  };

  // ===============================
  // 🔹 NORMAL DATA (USE TEMPLATE STYLE)
  // ===============================

  set("D6", data.factoryAddress);

  set("D10", data.factoryPhone);
  set("D12", data.factoryEmail);

  set("D14", data.officeAddress);
  set("D17", data.officePhone);
  set("D19", data.officeEmail);

  // IMPORTANT: force ONLY these 2 to normal
  const d21 = getCell("D21");
  d21.value = `EC No. ${data.ecNumber || ""} dated ${formatDate(data.ecDate)}`;
  d21.font = { name: "Times New Roman", size: 13, bold: false };

  const d27 = getCell("D27");
  d27.value = formatPeriod(data.periodOfClaim);
  d27.font = { name: "Times New Roman", size: 13, bold: false };

  // ===============================
  // 🔹 LOAN DETAILS
  // ===============================
  // ===============================
  // 🔹 DYNAMIC BANK DETAILS
  // ===============================

  // ===============================
  // 🔹 DYNAMIC BANK DETAILS
  // ===============================

  const bankDetails = (data.bankDetails || []).slice(0, 5);

  // original template supports 1 row
  const extraRows = Math.max(0, bankDetails.length - 1);

  // 🔥 INSERT EXTRA ROWS AFTER ROW 24
  if (extraRows > 0) {
    sheet.spliceRows(25, 0, ...Array(extraRows).fill([]));
  }

  // start row
  const bankStartRow = 24;

  // clear old template rows safely
  for (let i = 0; i < 5; i++) {
    ["D", "E", "F", "G", "H"].forEach((col) => {
      sheet.getCell(`${col}${bankStartRow + i}`).value = "";
    });
  }

  // fill bank details
  bankDetails.forEach((bank, index) => {
    const row = bankStartRow + index;

    set(`D${row}`, bank.bankName);
    set(`E${row}`, bank.loanAccountNumber);
    set(`F${row}`, formatDate(bank.loanSanctionDate));

    const sanctionedCell = sheet.getCell(`G${row}`);
    sanctionedCell.value = Number(bank.sanctionedAmount || 0);
    sanctionedCell.numFmt = "#,##0.00";

    const balanceCell = sheet.getCell(`H${row}`);
    balanceCell.value = Number(bank.loanBalance || 0);
    balanceCell.numFmt = "#,##0.00";

    sanctionedCell.alignment = {
      vertical: "middle",
      horizontal: "right",
    };

    balanceCell.alignment = {
      vertical: "middle",
      horizontal: "right",
    };
  });

  // ===============================
  // 🔹 DYNAMIC POSITIONING
  // ===============================

  // interest section shifts automatically
  const interestRow = 30 + extraRows;

  // footer shifts automatically
  const footerRow = 35 + extraRows;

  // ===============================
  // 🔹 INTEREST DETAILS
  // ===============================

  const interest = data.interestDetails?.[0];

  if (interest) {
    set(`D${interestRow}`, data.loanAccountNumber);
    set(`E${interestRow}`, interest.interestCharged);
    set(`F${interestRow}`, interest.interestPaid);
    set(`G${interestRow}`, formatPeriod(interest.period));

    sheet.getCell(`E${interestRow}`).numFmt = "#,##0.00";
    sheet.getCell(`F${interestRow}`).numFmt = "#,##0.00";
  }

  // ===============================
  // 🔹 FOOTER
  // ===============================

  set(`B${footerRow}`, `Place: ${data.place || ""}`);
  set(`B${footerRow + 1}`, `Date: ${formatDate(data.date)}`);

  const g35 = getCell(`G${footerRow}`);
  g35.value = data.authorizedSignatory || "";
  g35.font = {
    name: "Times New Roman",
    size: 13,
    bold: false,
  };

  const g36 = getCell(`G${footerRow + 1}`);
  g36.value = `(${data.authorizedSignatoryRole || ""})`;
  g36.font = {
    name: "Times New Roman",
    size: 13,
    bold: true,
  };
  // ===============================
  // 🔹 NUMBER FORMAT
  // ===============================
  ["G24", "H24", "E30", "F30"].forEach((ref) => {
    sheet.getCell(ref).numFmt = "#,##0.00";
  });

  return workbook;
};
