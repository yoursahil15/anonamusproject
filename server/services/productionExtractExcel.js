import ExcelJS from "exceljs";
import path from "path";

export const generateProductionExcel = async (data, master) => {
  const workbook = new ExcelJS.Workbook();

  const filePath = path.resolve("templates/13. Production extract.xlsx");
  await workbook.xlsx.readFile(filePath);

  const sheet1 = workbook.getWorksheet("Part (A)");
  const sheet2 = workbook.getWorksheet("Part B of Production Extract");

  if (!sheet1 || !sheet2) {
    throw new Error("Sheet names mismatch ❌");
  }

  // =========================
  // 🔹 DATE FORMAT FUNCTION (FIXED)
  // =========================
  function formatDate(d) {
    if (!d) return "";

    if (typeof d === "string" && d.includes("-")) {
      const parts = d.split("-");

      if (parts[0].length === 2) return d;

      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    const date = new Date(d);
    if (isNaN(date)) return "";

    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${date.getFullYear()}`;
  }

  // =========================
  // 🔹 SAFE DATA
  // =========================
  const rawMaterials = data.rawMaterials || [];
  const products = data.products || [];

  if (rawMaterials.length > 5 || products.length > 5) {
    throw new Error("Max 5 entries allowed");
  }

  // =========================
  // 🔥 SHEET 1 (PART A)
  // =========================

  sheet1.getColumn("E").width = 35;
  sheet1.getColumn("J").width = 25;

  const year = data.toDate
    ? new Date(data.toDate).getFullYear()
    : new Date().getFullYear();

  ["A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4", "I4", "J4", "K4"].forEach(
    (c) => {
      sheet1.getCell(c).value = "";
    },
  );

  sheet1.getCell("A4").value = `FOR THE YEAR ENDED 31ST MARCH, ${year}`;

  sheet1.getCell("A4").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  console.log("MASTER NAME:", master.nameOfIndustry);
  console.log("MASTER ADDRESS:", master.factoryAddress);
  console.log("MASTER PHONE:", master.phone);
  console.log("MASTER PRODUCTS:", master.productWithCapacity);
  sheet1.getCell("J8").value = master.nameOfIndustry || "";
  sheet1.getCell("J10").value = master.factoryAddress || "";
  sheet1.getCell("J12").value = master.phone || "";

  // PRODUCTS
  let productList = [];

  if (Array.isArray(master.productWithCapacity)) {
    productList = master.productWithCapacity;
  } else if (typeof master.productWithCapacity === "string") {
    const parts = master.productWithCapacity.split("-");
    productList = [
      {
        name: parts[0]?.trim() || "",
        capacity: parts[1]?.trim() || "",
      },
    ];
  }

  const startRow = 15;

  productList.forEach((item, index) => {
    const row = startRow + index;
    const label = String.fromCharCode(97 + index);

    sheet1.getCell(`D${row}`).value = `${label})`;
    sheet1.getCell(`E${row}`).value = item.name || "";
    sheet1.getCell(`J${row}`).value = item.capacity || "";

    sheet1.getCell(`E${row}`).alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: false,
    };
  });

  for (let i = productList.length; i < 5; i++) {
    const row = startRow + i;
    sheet1.getCell(`D${row}`).value = "";
    sheet1.getCell(`E${row}`).value = "";
    sheet1.getCell(`J${row}`).value = "";
  }

  sheet1.getCell("J19").value = master.startMonthYear || "";
  sheet1.getCell("J21").value = master.ssiRegistration?.number || "NA";
  sheet1.getCell("J23").value = master.constitution || "";

  sheet1.getCell("E26").value = data.directorName || "";
  sheet1.getCell("J26").value = data.directorAddress || "";

  sheet1.getCell("J26").alignment = { wrapText: true };

  const fci = master.fixedCapitalInvestment || {};

  sheet1.getCell("J30").value = fci.land || 0;
  sheet1.getCell("J31").value = fci.building || 0;
  sheet1.getCell("J32").value = fci.plantMachinery || 0;
  sheet1.getCell("J33").value = fci.electricals || 0;
  sheet1.getCell("J34").value = fci.other || 0;
  sheet1.getCell("J34").alignment = {
    horizontal: "left",
    vertical: "middle",
  };
  const totalFCI =
    Number(fci.land || 0) +
    Number(fci.building || 0) +
    Number(fci.plantMachinery || 0) +
    Number(fci.electricals || 0) +
    Number(fci.other || 0);

  sheet1.getCell("J35").value = totalFCI;

  sheet1.getCell("J35").alignment = {
    horizontal: "left",
    vertical: "middle",
  };

  sheet1.getCell("J39").value = master.financeAgency || "";
  sheet1.getCell("J40").value = master.bankName || "";
  sheet1.getCell("J41").value = master.workingCapital || "";

  sheet1.getCell("J44").value = master.registrations?.salesTax || "NA";
  sheet1.getCell("J46").value = master.registrations?.gst || "";
  sheet1.getCell("J48").value = master.registrations?.factoryAct || "NA";
  sheet1.getCell("J49").value = master.registrations?.excise || "NA";
  sheet1.getCell("J51").value = master.registrations?.pollutionNo || "";
  sheet1.getCell("J52").value = master.registrations?.pollutionDate || "";
  sheet1.getCell("J54").value = master.registrations?.localNoc || "NA";

  sheet1.getCell("J56").value = master.workers || 0;
  sheet1.getCell("J58").value = master.electricity || "";
  sheet1.getCell("J61").value = master.waterRequirement || "";

  sheet1.getCell("J68").value = `FOR ${master.nameOfIndustry || ""}`;
  sheet1.getCell("E73").value = formatDate(data.date);
  sheet1.getCell("E74").value = master.place || "";

  sheet1.getCell("J73").value = data.directorName || "";
  sheet1.getCell("J74").value = data.directorRole || "";

  // =========================
  // 🔥 SHEET 2
  // =========================

  sheet2.getCell("B2").value = master.nameOfIndustry || "";

  const from = formatDate(data.fromDate);
  const to = formatDate(data.toDate);

  sheet2.getCell("C4").value =
    from && to
      ? `Performance figures for (${from} to ${to})`
      : `Performance figures for Financial Year ${data.financialYear || ""}`;

  const VAL_COL = "E";

  // RAW MATERIALS
  const rawStart = 8;

  for (let i = 0; i < 5; i++) {
    sheet2.getCell(`${VAL_COL}${rawStart + i}`).value = "";
  }

  rawMaterials.slice(0, 2).forEach((item, i) => {
    const row = rawStart + i;
    const label = String.fromCharCode(97 + i);

    sheet2.getCell(`C${row}`).value = `${label}) ${item.name}`;
    sheet2.getCell(`${VAL_COL}${row}`).value =
      `${item.value ?? item.quantity ?? ""} ${item.unit || ""}`;
  });

  // PRODUCTS
  const productStart = 11;

  for (let i = 0; i < 5; i++) {
    sheet2.getCell(`${VAL_COL}${productStart + i}`).value = "";
  }

  products.slice(0, 2).forEach((item, i) => {
    const row = productStart + i;
    const label = String.fromCharCode(97 + i);

    sheet2.getCell(`C${row}`).value = `${label}) ${item.name}`;
    sheet2.getCell(`${VAL_COL}${row}`).value =
      `${item.value ?? item.quantity ?? ""} ${item.unit || ""}`;
  });

  // FIXED VALUES
  sheet2.getCell("E13").value = data.totalSales || 0;
  sheet2.getCell("E15").value = data.tax || 0;
  sheet2.getCell("E17").value = data.electricity || "";
  sheet2.getCell("E19").value = data.workers || 0;
  sheet2.getCell("E21").value = data.workingDays || 0;

  // FOOTER
  sheet2.getCell("C29").value = formatDate(data.date);
  sheet2.getCell("C30").value = master.place || "";

  sheet2.getCell("E29").value = data.authorizedSignatory || "";
  sheet2.getCell("E29").alignment = { horizontal: "center" };

  sheet2.getCell("E30").value = data.authorizedSignatoryRole || "";
  sheet2.getCell("E30").alignment = { horizontal: "center" };

  return workbook;
};
