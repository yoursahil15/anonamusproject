import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
// ================= DATE FORMATTERS =================

// dd.mm.yyyy  (for From & To dates)

function formatDateDots(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function totalCellWithBorder(value) {
  return new TableCell({
    borders: {
      bottom: {
        style: "double", // 🔥 double line
        size: 6, // thin line
        color: "000000",
      },
    },

    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: value,
            bold: true,
            size: 22,
          }),
        ],
      }),
    ],
  });
}
// dd/mm/yyyy (for UDIN date)

function formatDateSlash(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
export const generatePowerSubsidyWord = async (company, formData) => {
  const rows = [];
  // ================= FORMAT DATES =================

  const formattedFromDate = formatDateDots(formData.fromDate);

  const formattedToDate = formatDateDots(formData.toDate);

  const formattedUdinDate = formatDateSlash(formData.dateOfUdin);

  // ================= HEADER =================

  rows.push(
    new TableRow({
      children: [
        headerCell("Sr.\nNo."),

        headerCell("Month of\nBill"),

        headerCell("Rate /\nkwh"),

        headerCell("No. of Units\nConsumed\n(KWH)"),

        headerCell("Total Electricity\nCharges Billed"),

        headerCell("Total Electricity\nCharges Paid"),

        headerCell("Amount Eligible for Subsidy @ Rs. 1 per unit"),
      ],
    }),
  );

  // ================= MONTH DATA =================

  (formData.monthsData || []).forEach((row, index) => {
    rows.push(
      new TableRow({
        children: [
          cell(String(index + 1)),

          cell(row.month),

          cell(row.rate),

          cell(row.units),

          cell(row.billed),

          cell(row.paid),

          cell(row.subsidy),
        ],
      }),
    );
  });

  // ================= CALCULATE TOTALS =================

  let totalUnits = 0;
  let totalBilled = 0;
  let totalPaid = 0;
  let totalSubsidy = 0;

  (formData.monthsData || []).forEach((row) => {
    totalUnits += Number(row.units || 0);

    totalBilled += Number(row.billed || 0);

    totalPaid += Number(row.paid || 0);

    totalSubsidy += Number(row.subsidy || 0);
  });

  // ================= TOTAL =================

  rows.push(
    new TableRow({
      children: [
        totalCellWithBorder(""),

        totalCellWithBorder(""),

        totalCellWithBorder("Total"),

        totalCellWithBorder(totalUnits.toLocaleString("en-IN")),

        totalCellWithBorder(totalBilled.toLocaleString("en-IN")),

        totalCellWithBorder(totalPaid.toLocaleString("en-IN")),

        totalCellWithBorder(totalSubsidy.toLocaleString("en-IN")),
      ],
    }),
  );
  const table = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
      layout: "fixed",
    },

    columnWidths: [800, 1500, 1200, 1800, 2000, 2000, 2300],

    rows,
  });

  // ================= DOCUMENT =================

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),

          // On Letterhead

          new Paragraph(""),

          // Certificate No

          new Paragraph({
            children: [
              bold("Certificate No: ", 11),

              text(formData.certificateNo, 11),
            ],
          }),
          new Paragraph(""),

          new Paragraph(""),

          // ANNEXURE RIGHT

          rightBold("ANNEXURE – II/H", 11),
          new Paragraph(""),

          new Paragraph(""),

          // AUDITOR HEADING (Underline + Bold)

          new Paragraph({
            alignment: AlignmentType.CENTER,

            children: [
              new TextRun({
                text: "Auditor’s Certificate for Power Tariff Subsidy under PSI – 2019",

                bold: true,
                underline: {},
                size: 26, // 13 font
              }),
            ],
          }),
          new Paragraph(""),

          new Paragraph(""),

          new Paragraph(""),

          // ================= MAIN PARAGRAPH =================

          // FIRST PARAGRAPH
          new Paragraph({
            children: [
              new TextRun({
                text: "\t",
                size: 22,
              }),

              text(
                "I hereby certify that from the examination of the Books of Accounts and other relevant records of the applicant ",
                11,
              ),
              new TextRun({
                text: company.nameOfCompany,
                bold: true,
                underline: {},
                size: 22,
              }),

              text(" Located at ", 11),

              new TextRun({
                text: formData.factoryAddress,
                bold: true,
                underline: {},
                size: 22,
              }),

              text(", the unit has paid ", 11),

              // ✅ AMOUNT UNDERLINE

              new TextRun({
                text: formData.totalElectricityPaid || "",
                bold: true,
                underline: {},
                size: 22,
              }),
              text(" as power tariff (", 11),

              new TextRun({
                text: "Electricity Charges",
                bold: false,
                size: 22,
              }),

              text(") for the accounting year from ", 11),

              // ✅ FROM DATE UNDERLINE

              text(formattedFromDate, 11),

              text(" to ", 11),

              // ✅ TO DATE UNDERLINE

              text(formattedToDate, 11),

              text(
                ". The statements made and particulars furnished herein for Power Tariff Subsidy are correct and to the best of my knowledge and belief.",
                11,
              ),
            ],
          }),
          new Paragraph(""),

          // SECOND PARAGRAPH

          new Paragraph({
            children: [
              new TextRun({
                text: "\t",
                size: 22,
              }),

              text(
                "I hereby further certify that the figures shown herein do not include penalty, surcharge or any other charges and are only in respect of electric charges paid by the eligible unit for power required to produce eligible items as per Eligibility Certificate.",
                11,
              ),
            ],
          }),

          new Paragraph(""),

          // ================= TABLE =================

          // DETAILS LINE ABOVE TABLE

          centerBold(
            `Details of Electricity Charges from ${formattedFromDate} to ${formattedToDate}`,
            11,
          ),

          new Paragraph(""),

          table,

          new Paragraph(""),
          new Paragraph(""),

          // ================= FIRM =================

          rightBold("For Sarda Soni Associates LLP", 12),

          rightBold("Chartered Accountants", 12),

          right("Firm Regtn. No-117235W/W100126", 9),

          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),

          // ================= FOOTER =================
          new Paragraph({
            tabStops: [
              {
                type: "right",
                position: 9000,
              },
            ],

            children: [
              bold("UDIN: ", 11),
              new TextRun({
                text: formData.udin || "",
                size: 22,
              }),

              new TextRun({
                text: "\t",
              }),

              new TextRun({
                text: formData.authorizedSignatory || "",
                bold: true,
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            tabStops: [
              {
                type: "right",
                position: 9000,
              },
            ],

            children: [
              bold("Place: ", 11),
              new TextRun({
                text: formData.place || "",

                size: 22,
              }),

              new TextRun({
                text: "\t",
              }),

              new TextRun({
                text: formData.authorizedSignatoryRole || "",
                bold: true,
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            tabStops: [
              {
                type: "right",
                position: 9000,
              },
            ],

            children: [
              bold("Date: ", 11),
              new TextRun({
                text: formattedUdinDate,

                size: 22,
              }),
              new TextRun({
                text: "\t",
              }),

              new TextRun({
                text: `M. No. ${formData.membershipNumber}`,
                bold: true,
                size: 22,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
};

// ================= HELPERS =================

function cell(value) {
  return new TableCell({
    margins: {
      top: 100,
      bottom: 100,
      left: 80,
      right: 80,
    },

    children: [
      new Paragraph({
        spacing: {
          before: 80,
          after: 80,
        },

        children: [
          new TextRun({
            text: value || "",
            size: 22,
          }),
        ],
      }),
    ],
  });
}

function centerBold(value, size) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,

    children: [
      new TextRun({
        text: value,
        bold: true,
        size: size * 2,
      }),
    ],
  });
}
function headerSpanCell(value, span) {
  return new TableCell({
    columnSpan: span,

    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: value,
            bold: true,
            size: 22,
          }),
        ],
      }),
    ],
  });
}

function headerCell(value) {
  return new TableCell({
    margins: {
      top: 120,
      bottom: 120,
      left: 80,
      right: 80,
    },

    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,

        children: [
          new TextRun({
            text: value,
            bold: true,
            size: 22,
          }),
        ],
      }),
    ],
  });
}
function totalCell(value) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: value,
            bold: true,
            size: 22,
          }),
        ],
      }),
    ],
  });
}

function bold(value, size) {
  return new TextRun({
    text: value,
    bold: true,
    size: size * 2,
  });
}

function text(value, size) {
  return new TextRun({
    text: value || "",
    size: size * 2,
  });
}

function underlineText(value, size) {
  return new TextRun({
    text: value || "",
    underline: {},
    size: size * 2,
  });
}

function center(value, size) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,

    children: [
      new TextRun({
        text: value,
        size: size * 2,
      }),
    ],
  });
}

function right(value, size) {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,

    children: [
      new TextRun({
        text: value,
        size: size * 2,
      }),
    ],
  });
}

function rightBold(value, size) {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,

    children: [
      new TextRun({
        text: value,
        bold: true,
        size: size * 2,
      }),
    ],
  });
}

function rightUnderline(value, size) {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,

    children: [
      new TextRun({
        text: value,
        underline: {},
        size: size * 2,
      }),
    ],
  });
}
