import ExcelJS from "exceljs";
import path from "path";

export const generateELPExcel = async (company, data) => {
  try {
    const workbook = new ExcelJS.Workbook();

    const filePath = path.resolve("templates/12. ELP.xlsx");
    await workbook.xlsx.readFile(filePath);

    const sheet1 = workbook.getWorksheet("Sheet1");
    const sheet2 = workbook.getWorksheet("Sheet2");

    // =========================
    // 🔥 GLOBAL FONT FIX
    // =========================

    const applyTimesNewRoman = (workbook) => {
      workbook.eachSheet((sheet) => {
        sheet.eachRow((row) => {
          row.eachCell({ includeEmpty: true }, (cell) => {
            const existingFont = cell.font || {};

            cell.font = {
              name: "Times New Roman",
              size: existingFont.size || 11,
              bold: existingFont.bold || false,
              italic: existingFont.italic || false,
              underline: existingFont.underline || false,
            };
          });
        });
      });
    };

    // =========================
    // 🔹 SHEET 1 STATIC DATA
    // =========================

    sheet1.getCell("F10").value = data.nameOfCompany;

    sheet1.getCell("F10").font = {
      name: "Times New Roman",
      bold: true,
    };

    sheet1.getCell("F13").value = data.registeredOfficeAddress;

    sheet1.getCell("F13").font = {
      name: "Times New Roman",
      bold: false,
    };

    sheet1.getCell("F20").value = data.factoryAddress;

    sheet1.getCell("F20").font = {
      name: "Times New Roman",
      bold: false,
    };

    // =========================
    // 🔹 FULLY DYNAMIC PRODUCTS
    // =========================

    const productsData =
      data.productsManufactured || data.eligibleProducts || [];

    const products = Array.isArray(productsData)
      ? productsData
      : [productsData];

    // remove empty values
    const filteredProducts = products.filter(
      (p) => p && String(p).trim() !== "",
    );

    // at least 1 row
    const totalProducts =
      filteredProducts.length > 0 ? filteredProducts.length : 1;

    // template already has row 24
    const extraRows = totalProducts - 1;

    // 🔥 SHIFT ENTIRE CONTENT BELOW
    if (extraRows > 0) {
      sheet1.spliceRows(25, 0, ...Array(extraRows).fill([]));
    }

    const productStartRow = 24;

    // clear rows
    for (let i = 0; i < totalProducts + 5; i++) {
      sheet1.getCell(`E${productStartRow + i}`).value = "";
    }

    // fill products
    filteredProducts.forEach((product, index) => {
      const row = productStartRow + index;

      const cell = sheet1.getCell(`E${row}`);

      cell.value = product;

      cell.font = {
        name: "Times New Roman",
        size: 11,
        bold: true,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      };
    });

    // =========================
    // 🔹 DYNAMIC POSITIONING
    // =========================

    // =========================
    // 🔹 DYNAMIC POSITIONING
    // =========================

    const shift = extraRows;

    // 🔥 YEAR OF ESTABLISHMENT
    const yearRow = 28 + shift;

    sheet1.getCell(`E${yearRow}`).value = data.yearOfIncorporation || "";

    sheet1.getCell(`E${yearRow}`).font = {
      name: "Times New Roman",
      size: 11,
      bold: true,
    };

    sheet1.getCell(`E${yearRow}`).alignment = {
      vertical: "middle",
      horizontal: "left",
    };

    // 🔥 HR KNOWS MARATHI
    const marathiRow = 41 + shift;

    sheet1.getCell(`I${marathiRow}`).value = data.hrKnowsMarathi || "";

    sheet1.getCell(`I${marathiRow}`).font = {
      name: "Times New Roman",
      size: 11,
      bold: true,
    };

    sheet1.getCell(`I${marathiRow}`).alignment = {
      vertical: "middle",
      horizontal: "left",
    };

    // 🔥 FACTORIES ACT
    const factoryActRow = 43 + shift;

    sheet1.getCell(`I${factoryActRow}`).value =
      data.registeredUnderFactoriesAct || "";

    sheet1.getCell(`I${factoryActRow}`).font = {
      name: "Times New Roman",
      size: 11,
      bold: true,
    };

    sheet1.getCell(`I${factoryActRow}`).alignment = {
      vertical: "middle",
      horizontal: "left",
    };

    // =========================
    // 🔥 SHEET 2 HEADER
    // =========================

    sheet2.getCell("A4").value = {
      richText: [
        { text: "The Employment Status as on 31st March " },
        { text: data.year, font: { bold: true } },
        {
          text: " my/our Industrial enterprise mentioned above is as under:",
        },
      ],
    };

    // =========================
    // 🔹 HELPERS
    // =========================

    const safePercent = (a, b) => {
      if (!b || b === 0) return "0.00%";

      return ((a / b) * 100).toFixed(2) + "%";
    };

    const rightAlign = (cell) => {
      cell.alignment = {
        horizontal: "right",
      };
    };

    // =========================
    // 🔹 CURRENT DATA
    // =========================

    const currentTotal =
      (data.currentTotalSupervisory || 0) + (data.currentTotalOther || 0);

    const currentLocal =
      (data.currentLocalSupervisory || 0) + (data.currentLocalOther || 0);

    sheet2.getCell("D9").value = data.currentTotalSupervisory;

    sheet2.getCell("E9").value = data.currentTotalOther;

    sheet2.getCell("F9").value = currentTotal;

    sheet2.getCell("D10").value = data.currentLocalSupervisory;

    sheet2.getCell("E10").value = data.currentLocalOther;

    sheet2.getCell("F10").value = currentLocal;

    const d11 = sheet2.getCell("D11");
    const e11 = sheet2.getCell("E11");
    const f11 = sheet2.getCell("F11");

    d11.value = safePercent(
      data.currentLocalSupervisory,
      data.currentTotalSupervisory,
    );

    e11.value = safePercent(data.currentLocalOther, data.currentTotalOther);

    f11.value = safePercent(currentLocal, currentTotal);

    rightAlign(d11);
    rightAlign(e11);
    rightAlign(f11);

    // =========================
    // 🔹 PREVIOUS DATA
    // =========================

    const prevTotal =
      (data.previousTotalSupervisory || 0) + (data.previousTotalOther || 0);

    const prevLocal =
      (data.previousLocalSupervisory || 0) + (data.previousLocalOther || 0);

    sheet2.getCell("D13").value = data.previousTotalSupervisory;

    sheet2.getCell("E13").value = data.previousTotalOther;

    sheet2.getCell("F13").value = prevTotal;

    sheet2.getCell("D14").value = data.previousLocalSupervisory;

    sheet2.getCell("E14").value = data.previousLocalOther;

    sheet2.getCell("F14").value = prevLocal;

    const d15 = sheet2.getCell("D15");
    const e15 = sheet2.getCell("E15");
    const f15 = sheet2.getCell("F15");

    d15.value = safePercent(
      data.previousLocalSupervisory,
      data.previousTotalSupervisory,
    );

    e15.value = safePercent(data.previousLocalOther, data.previousTotalOther);

    f15.value = safePercent(prevLocal, prevTotal);

    rightAlign(d15);
    rightAlign(e15);
    rightAlign(f15);

    // =========================
    // 🔹 DECLARATION
    // =========================

    sheet2.getCell("D27").value = data.declarationSupervisory;

    sheet2.getCell("D28").value = data.declarationOther;

    sheet2.getCell("D29").value = data.declarationTotal;

    // =========================
    // 🔹 FOOTER
    // =========================

    sheet2.getCell("B46").value = data.place;

    sheet2.getCell("B46").font = {
      name: "Times New Roman",
      bold: false,
    };

    // DATE
    const dateCell = sheet2.getCell("B48");

    if (data.date) {
      const [day, month, year] = data.date.split("-");

      const parsedDate = new Date(`${year}-${month}-${day}`);

      if (!isNaN(parsedDate)) {
        dateCell.value = parsedDate;
        dateCell.numFmt = "dd.mm.yyyy";
      } else {
        dateCell.value = data.date;
      }
    } else {
      dateCell.value = "";
    }

    dateCell.font = {
      name: "Times New Roman",
      bold: false,
    };

    // SIGNATURE
    sheet2.getCell("E51").value = data.authorizedSignatory || "";

    sheet2.getCell("E51").font = {
      name: "Times New Roman",
      bold: false,
    };

    // ROLE
    sheet2.getCell("E52").value = data.authorizedSignatoryRole;

    sheet2.getCell("E52").font = {
      name: "Times New Roman",
      bold: true,
    };

    // =========================
    // 🔥 APPLY FONT FIX
    // =========================

    applyTimesNewRoman(workbook);

    return workbook;
  } catch (error) {
    console.error("❌ ELP Excel Error:", error);

    throw new Error("Failed to generate ELP Excel");
  }
};
