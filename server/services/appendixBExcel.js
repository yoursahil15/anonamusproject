import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateAppendixBExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();

  const filePath = path.join(
    __dirname,
    "..",
    "templates",
    "9. Appendix - B.xlsx",
  );

  console.log(`📄 Loading template: ${filePath}`);

  try {
    await workbook.xlsx.readFile(filePath);
  } catch (error) {
    console.error(`❌ Failed to read template: ${error.message}`);
    throw new Error(`Template file not found or cannot be read: ${filePath}`);
  }

  const sheet = workbook.getWorksheet(1);

  if (!sheet) {
    throw new Error("❌ Sheet not found");
  }

  // ===============================
  // 🔥 HELPER
  // ===============================
  const setCell = (cell, value, align = "left", wrap = false) => {
    const c = sheet.getCell(cell);

    c.value = value ?? "";

    c.font = {
      name: "Times New Roman",
      size: 11,
    };

    c.alignment = {
      vertical: "middle",
      horizontal: align,
      wrapText: wrap,
    };
  };

  // ===============================
  // 🔹 FORMAT HELPERS
  // ===============================
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
  };

  const formatPeriod = (period) => {
    if (!period) return "";

    // ✅ If already string (YOUR CASE)
    if (typeof period === "string") {
      return period.startsWith("From") ? period : `From ${period}`;
    }

    // ✅ If object
    if (period.from && period.to) {
      return `From ${formatDate(period.from)} to ${formatDate(period.to)}`;
    }

    return "";
  };

  const breakText = (text, limit = 35) => {
    if (!text) return "";

    if (text.length <= limit) return text;

    let index = text.lastIndexOf(" ", limit);
    if (index === -1) index = limit;

    return text.slice(0, index) + "\n" + text.slice(index + 1);
  };

  const toScientific = (num) => {
    if (!num) return "";
    return Number(num).toExponential(4).replace("e+", "E+");
  };

  // ===============================
  // 🔹 STATIC DATA
  // ===============================
  setCell("D5", data.nameOfCompany || data.unitName);
  setCell("D7", data.factoryAddress);
  setCell("D10", data.factoryPhone);
  setCell("D12", data.factoryEmail);

  setCell("D14", data.officeAddress);
  setCell("D16", data.officePhone);
  setCell("D18", data.officeEmail);

  setCell(
    "D20",
    `EC No. ${data.ecNumber || ""} dated ${formatDate(data.ecDate)}`,
  );

  // ✅ FIXED (ONLY ONCE)
  setCell("D22", formatPeriod(data.eligiblePeriod));

  setCell("D27", data.subsidyClaimed);

  // ===============================
  // 🔥 POWER COMPANY (D30 - WRAP FIX)
  // ===============================
  const powerCell = sheet.getCell("D30");

  powerCell.value = breakText(
    data.powerCompany || "Maharashtra State Electricity Distribution Co. Ltd.",
  );

  powerCell.alignment = {
    vertical: "middle",
    horizontal: "left",
    wrapText: true, // ✅ force wrap
  };

  // ✅ IMPORTANT: set column width
  sheet.getColumn("D").width = 35;

  // ===============================
  // 🔥 CONSUMER NUMBER (E30 - WRAP FIX)
  // ===============================
  const consumerCell = sheet.getCell("E30");

  consumerCell.value = `Consumer No:\n${data.consumerNumber || ""}`;

  consumerCell.alignment = {
    vertical: "middle",
    horizontal: "left",
    wrapText: true, // ✅ force wrap
  };

  // ✅ IMPORTANT: set column width
  sheet.getColumn("E").width = 25;

  // 🔥 VERY IMPORTANT (ROW HEIGHT AUTO)
  // 🔥 FORCE WRAP + FIX ROW HEIGHT (for merged cells)
  const textLength =
    (powerCell.value?.toString().length || 0) +
    (consumerCell.value?.toString().length || 0);

  sheet.getRow(30).height = Math.max(30, Math.ceil(textLength / 20) * 15);
  // ===============================
  // 🔹 CONNECTION DETAILS
  // ===============================
  setCell("F30", formatDate(data.connectionDate));
  setCell("G30", data.tariffRate);

  // ===============================
  // 🔹 CLAIM PERIODS
  // ===============================
  setCell("D25", formatPeriod(data.periodOfClaim6));
  setCell("D32", formatPeriod(data.periodOfClaim9));

  // ===============================
  // 🔹 BLOCK 1
  // ===============================
  setCell("D35", String(data.consumerNumber || ""));
  setCell("E35", data.meterNumber10 || "");

  setCell("F35", data.unitsConsumed10);
  setCell("G35", data.chargesBilled10);
  setCell("H35", data.chargesPaid10);

  // ===============================
  // 🔹 BLOCK 2
  // ===============================
  setCell("D38", String(data.consumerNumber));
  setCell("E38", data.meterNumber11 || "");

  setCell("F38", data.unitsConsumed11);
  setCell("G38", data.chargesBilled11);
  setCell("H38", data.chargesPaid11);

  // ===============================
  // 🔹 FOOTER
  // ===============================
  setCell("B41", `Place: ${data.place || ""}`);
  setCell("B43", `Date: ${formatDate(data.date)}`);

  // ✅ AUTHORIZED SIGNATORY
  setCell("G43", data.authorizedSignatory);

  // ✅ ROLE
  setCell("G44", `(${data.authorizedSignatoryRole || ""})`);

  // ✅ Bold Role
  const roleCell = sheet.getCell("G44");

  roleCell.font = {
    name: "Times New Roman",
    size: 11,
    bold: true,
  };

  roleCell.alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  const fillElectricityWorkingSheet = (workbook, data) => {
    const sheet =
      workbook.getWorksheet("Electricity Working") || workbook.getWorksheet(2);

    if (!sheet) {
      console.log("❌ Electricity sheet not found");
      return;
    }

    // ===============================
    // 🔹 HELPERS
    // ===============================
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, "0")}.${String(
        d.getMonth() + 1,
      ).padStart(2, "0")}.${d.getFullYear()}`;
    };

    const formatPeriod = (period) => {
      if (!period) return "";
      if (period.from && period.to) {
        return `from ${formatDate(period.from)} to ${formatDate(period.to)}`;
      }
      return "";
    };

    // 🔥 SAFE NUMBER CONVERTER (IMPORTANT FIX)
    const num = (v) => {
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };

    // ===============================
    // 👉 CELL HELPERS
    // ===============================
    const setPlainCell = (cellRef, value, align = "center") => {
      const cell = sheet.getCell(cellRef);

      cell.value = value ?? "";

      cell.font = {
        name: "Times New Roman",
        size: 11,
        bold: false,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: align,
      };
    };

    const setBoldCell = (cellRef, value, align = "center") => {
      const cell = sheet.getCell(cellRef);

      cell.value = value ?? "";

      cell.font = {
        name: "Times New Roman",
        size: 11,
        bold: true,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: align,
      };
    };

    // ===============================
    // 🔹 HEADER
    // ===============================
    setBoldCell("D1", data.unitName || "", "center");

    setBoldCell(
      "B3",
      `Details of Electricity Charges ${formatPeriod(data.eligiblePeriod)}`,
      "center",
    );

    // ===============================
    // 🔹 TABLE DATA (FIXED TYPES)
    // ===============================
    const startRow = 5;
    let rows = data.electricityWorking || [];

    // ✅ FIX: Ensure rows is always an array
    if (!Array.isArray(rows)) {
      rows = [];
    }
    const subsidyRate = num(data.subsidyRate || 1);

    rows.slice(0, 12).forEach((item, index) => {
      const row = startRow + index;

      const units = num(item.units);
      const rate = num(item.rate);
      const billed = num(item.billed);
      const paid = num(item.paid);

      setBoldCell(`A${row}`, index + 1);
      setPlainCell(`B${row}`, item.month, "left");
      setPlainCell(`C${row}`, rate);
      setPlainCell(`D${row}`, units);
      setPlainCell(`E${row}`, billed);
      setPlainCell(`F${row}`, paid);

      // 🔥 subsidy calculation
      setPlainCell(`G${row}`, units * subsidyRate);
    });

    // ===============================
    // 🔹 TOTAL ROW (FIXED)
    // ===============================
    const totalRow = startRow + 12;
    const totalUnits = rows.reduce((sum, i) => sum + num(i?.units), 0);
    const totalBilled = rows.reduce((sum, i) => sum + num(i?.billed), 0);
    const totalPaid = rows.reduce((sum, i) => sum + num(i?.paid), 0);

    const totalSubsidy = rows.reduce(
      (sum, i) => sum + num(i?.units) * subsidyRate,
      0,
    );

    setBoldCell(`D${totalRow}`, totalUnits);
    setBoldCell(`E${totalRow}`, totalBilled);
    setBoldCell(`F${totalRow}`, totalPaid);
    setBoldCell(`G${totalRow}`, totalSubsidy);

    // ===============================
    // 🔹 NUMBER FORMAT (SAFE)
    // ===============================
    for (let i = startRow; i <= totalRow; i++) {
      ["C", "D", "E", "F", "G"].forEach((col) => {
        const cell = sheet.getCell(`${col}${i}`);
        cell.numFmt = "#,##0.00";
      });
    }
  };
  fillElectricityWorkingSheet(workbook, data);
  // ===============================
  // 🔥 FORCE FONT
  // ===============================
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.font = {
        name: "Times New Roman",
        size: 11,
        bold: cell.font?.bold || false,
      };
    });
  });

  return workbook;
};
