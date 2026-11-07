import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateBankInterestExcel = async (company, bank, data) => {
  const workbook = new ExcelJS.Workbook();
  const formatDateSlash = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d)) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };
  const filePath = path.join(
    __dirname,
    "..",
    "templates",
    "8. Bank Certificate-Interest.xlsx",
  );

  console.log(`📄 Loading template: ${filePath}`);

  try {
    await workbook.xlsx.readFile(filePath);
  } catch (error) {
    console.error(`❌ Failed to read template: ${error.message}`);
    throw new Error(`Template file not found or cannot be read: ${filePath}`);
  }

  const sheet = workbook.getWorksheet("Certificate");

  if (!sheet) {
    throw new Error("❌ Certificate sheet not found");
  }

  // ================= HELPERS =================

  const formatDate = (date) => {
    if (!date) return "";

    // handle already formatted string
    if (typeof date === "string" && date.includes(".")) {
      return date;
    }

    const d = new Date(date);
    if (isNaN(d)) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const setCell = (row, col, value) => {
    const cell = sheet.getRow(row).getCell(col);
    cell.value = value ?? "";

    cell.font = {
      name: "Times New Roman",
      size: 11,
      bold: false,
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
  };

  // =====================================================
  // 🔥 HEADER TEXT (INLINE REPLACEMENT)
  // =====================================================
  sheet.getCell("H6").font = {
    name: "Times New Roman",
    size: 11,
    bold: true,
  };
  sheet.getCell("H6").font = { bold: true };
  sheet.getCell("H6").alignment = { horizontal: "right" };
  sheet.getCell("E7").font = {
  name: "Times New Roman",
  size: 14,
  bold: true,
  underline: true,
};
  sheet.getCell("E9").font = {
  name: "Times New Roman",
  size: 12,
  bold: true,
  underline: true,
};

  sheet.getCell("A10").value = {
  richText: [
    {
      text: `This is to certify that we have financed Term Loan of Rs. ${
        data?.loanSanctionAmount || ""
      }/- to ${
        company?.nameOfCompany || ""
      } ${company?.factoryAddress || ""}. We furnish here in below the details of Interest Charged on this Term Loan from ${formatDate(
        data?.dateFrom,
      )} to ${formatDate(data?.dateTo)} on regular repayment of `,
      font: {
        name: "Times New Roman",
        size: 11,
      },
    },

    {
      text: `Term Loan installment. TL Account - ${
        data?.accountNumber || ""
      }.`,
      font: {
        name: "Times New Roman",
        size: 11,
        bold: true,
      },
    },

    {
      text: ` This does not include Penal Interest.`,
      font: {
        name: "Times New Roman",
        size: 11,
      },
    },
  ],
};
  // =====================================================
  // 🔥 DYNAMIC TABLE (PROPER STRUCTURE)
  // =====================================================

  const startRow = 14;
  const rows = Array.isArray(data?.rows) ? data.rows : [];

  if (rows.length === 0) rows.push({});

  // 🔥 IMPORTANT: duplicate template row instead of splice
  for (let i = 1; i < rows.length; i++) {
    sheet.duplicateRow(startRow, 1, true); // keeps formatting
  }

  let totalDue = 0;
  let totalPaid = 0;
  let totalSubsidy = 0;

  rows.forEach((row, index) => {
    const r = startRow + index;

    setCell(r, 1, row.typeOfLoan); // B
setCell(
  r,
  2,
  `${formatDate(row.periodFrom)}\nto\n${formatDate(row.periodTo)}`,
);
sheet.getRow(r).getCell(2).alignment = {
  vertical: "middle",
  horizontal: "center",
  wrapText: true,
};
sheet.getColumn(2).width = 14;
    setCell(r, 3, row.rate); // D
    setCell(r, 4, formatDate(row.date));
    setCell(r, 5, Number(row.amount || 0));

    setCell(r, 6, formatDate(row.date));
    setCell(r, 7, Number(row.amount || 0));

    const subsidy = Number(row.subsidyAmount || 0);
    setCell(r, 8, subsidy); // I

    totalDue += Number(row.dueAmount || 0);
    totalPaid += Number(row.paidAmount || 0);
    totalSubsidy += subsidy;
  });

  // =====================================================
  // 🔥 TOTAL ROW (CORRECT FINAL FIX)
  // =====================================================

  // 👉 IMPORTANT: DO NOT duplicate row here

  const totalRow = startRow + rows.length;

  // 👉 CLEAR that row first (removes template garbage)
  const rowObj = sheet.getRow(totalRow);
  rowObj.values = []; // 💥 THIS FIXES YOUR ISSUE

  // 👉 OPTIONAL: keep TOTAL label (if not already in template)
  sheet.getCell(`B${totalRow}`).value = "TOTAL";
  // 🔥 BOLD FIRST TOTAL ROW (correct one)
  ["B", "E", "G", "H"].forEach((col) => {
    const cell = sheet.getCell(`${col}${totalRow}`);
    cell.font = {
      name: "Times New Roman",
      size: 11,
      bold: true,
    };
  });

  // 👉 APPLY FORMULAS + FONT

  // E column (Interest Due)
  const cellE = sheet.getCell(`E${totalRow}`);
  cellE.value = { formula: `SUM(E${startRow}:E${totalRow - 1})` };
  cellE.font = { name: "Times New Roman", size: 11, bold: true };
  cellE.numFmt = "#,##0.00";

  // G column (Interest Paid)
  const cellG = sheet.getCell(`G${totalRow}`);
  cellG.value = { formula: `SUM(G${startRow}:G${totalRow - 1})` };
  cellG.font = { name: "Times New Roman", size: 11, bold: true };
  cellG.numFmt = "#,##0.00";

  // H column (Interest @ 5%)
  const cellH = sheet.getCell(`H${totalRow}`);
  cellH.value = { formula: `SUM(H${startRow}:H${totalRow - 1})` };
  cellH.font = { name: "Times New Roman", size: 11, bold: true };
  cellH.numFmt = "#,##0.00";
  // 👉 formatting
  ["E", "G", "H"].forEach((col) => {
    const cell = sheet.getCell(`${col}${totalRow}`);
    cell.font = { bold: true };
    cell.numFmt = "#,##0.00";
  });
  // 🔥 ADD 2 HORIZONTAL THIN LINES AFTER TOTAL

  const lineRow1 = totalRow;
  const lineRow2 = totalRow + 1;

  // apply bottom border to TOTAL row
  sheet.getRow(lineRow1).eachCell((cell) => {
    cell.border = {
      bottom: { style: "thin" },
    };
  });

  // apply bottom border to next row (second line)
  sheet.getRow(lineRow2).eachCell((cell) => {
    cell.border = {
      bottom: { style: "thin" },
    };
  });
  // 🔥 FULL WIDTH DOUBLE LINE BELOW TOTAL (A → H)

  const startCol = 1; // A
  const endCol = 8; // H (adjust if your table width changes)

  for (let col = startCol; col <= endCol; col++) {
    const cell = sheet.getRow(totalRow).getCell(col);

    cell.border = {
      bottom: { style: "double" },
    };
  }
  // =====================================================
  // 🔥 CLEANUP (REMOVE MASTER SHEET)
  // =====================================================

  const masterSheet = workbook.getWorksheet("Master Sheet");
  if (masterSheet) {
    workbook.removeWorksheet(masterSheet.id);
  }
  // 🔥 FORCE TIMES NEW ROMAN ON ENTIRE SHEET (FINAL OVERRIDE)
 sheet.eachRow((row) => {
  row.eachCell((cell) => {
    cell.font = {
      ...cell.font,
      name: "Times New Roman",
      size: cell.font?.size || 11,
    };
  });
});
  // 🔥 REMOVE 2 EXTRA ROWS BELOW TOTAL
  sheet.spliceRows(totalRow + 1, 2);
  return workbook;
};
