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

// ================= DATE FORMATTER =================
function footerLineCustom(label, leftValue, rightValue, rightSize) {
  return new Paragraph({
    tabStops: [
      {
        type: "right",
        position: 9000,
      },
    ],

    children: [
      bold(label, 11),

      underlineText(leftValue, 11),

      new TextRun({
        text: "\t",
      }),

      new TextRun({
        text: rightValue,
        bold: true,
        underline: {},
        size: rightSize * 2,
      }),
    ],
  });
}

function complexHeader(title) {
  return new TableCell({
    columnSpan: 2,

    margins: {
      top: 60,
      bottom: 60,
      left: 40,
      right: 40,
    },

    children: [
      // TOP TITLE
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 20,
          }),
        ],
      }),

      new Paragraph(""),

      // 🔥 NESTED TABLE (this creates real border)
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        layout: "fixed",

        columnWidths: [1500, 1500],

        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: "none" },
                  bottom: { style: "none" },
                  left: { style: "none" },
                  right: { style: "single", size: 4, color: "000000" }, // ONLY divider
                },

                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "Date",
                        bold: true,
                        size: 22,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                borders: {
                  top: { style: "none" },
                  bottom: { style: "none" },
                  left: { style: "none" },
                  right: { style: "none" }, // no outer border
                },

                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "Amt.",
                        bold: true,
                        size: 22,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function headerSpanCell(value, span) {
  return new TableCell({
    columnSpan: span,
    verticalAlign: "center", // ✅ vertical center

    margins: {
      top: 60,
      bottom: 60,
      left: 40,
      right: 40,
    },

    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER, // ✅ horizontal center

        spacing: {
          before: 0,
          after: 0,
          line: 240,
        },

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
// DD-MM-YYYY
function formatDateDots(dateStr) {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  } catch {
    return "";
  }
}
function formatDateDash(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

// ================= MAIN FUNCTION =================
export const generateInterestSubsidyWord = async (company, bank, formData) => {
  const rows = [];

  // ================= FORMAT DATES =================

  const formattedInterestFrom = formatDateDots(formData.interestFromDate);

  const formattedInterestTo = formatDateDots(formData.interestToDate);

  const formattedUdinDate = formatDateDash(formData.dateOfUdin);

  // ================= HEADER ROW 1 =================
  rows.push(
    new TableRow({
      children: [
        headerCell("Type of Loan", 2),
        headerCell("Period", 2),
        headerCell("Rate of Interest", 2),

        headerSpanCell("Total Interest Due", 2),
        headerSpanCell("Interest Paid Amount", 2),
        headerCell("Interest Amount @ 5%"),
      ],
    }),
  );

  rows.push(
    new TableRow({
      children: [
        smallHeader("Date"),
        smallHeader("Amt."),

        smallHeader("Date"),
        smallHeader("Amt."),

        smallHeader("Amount"),
      ],
    }),
  );
  // ================= DATA ROWS =================
  (formData.loanData || []).forEach((row) => {
    const dueDate = formatDateDots(row.dueDate);
    const paidDate = formatDateDots(row.dueDate); // ✅ SAME

    const from = formatDateDots(row.periodFrom);
    const to = formatDateDots(row.periodTo);

    const period = from && to ? `${from} to ${to}` : from || to || "-";

    const dueAmount = Number(String(row.dueAmount || 0).replace(/,/g, ""));
    const paidAmount = dueAmount; // ✅ SAME

    const interest5 = Number((paidAmount * 0.5).toFixed(2));
    rows.push(
      new TableRow({
        children: [
          cell(row.loanType),
          cell(period),
          cell(row.rate),

          cell(dueDate),
          cell(row.dueAmount, true),
          cell(paidDate),
          cell(row.dueAmount, true),

          cell(interest5.toLocaleString("en-IN"), true),
        ],
      }),
    );
  });

  // ================= TOTAL =================
  let totalDue = 0;
  let totalPaid = 0;
  let totalInterest = 0;

  (formData.loanData || []).forEach((row) => {
    const due = Number(String(row.dueAmount || 0).replace(/,/g, ""));
    const paid = Number(String(row.dueAmount || 0).replace(/,/g, ""));

    totalDue += due;
    totalPaid += paid;
    totalInterest += Number((paid * 0.05).toFixed(2));
  });

  rows.push(
    new TableRow({
      children: [
        totalCell("TOTAL", true),
        totalCell("", true),
        totalCell("", true),

        totalCell("", true),
        totalCell(
          totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
          true,
        ),

        totalCell("", true),
        totalCell(
          totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
          true,
        ),

        totalCell(
          totalInterest.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
          true,
        ),
      ],
    }),
  );
  // ================= TABLE =================
  const table = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },

    layout: "fixed",

    // 🔥 IMPORTANT: equal distribution (prevents overflow)
    columnWidths: [1600, 2400, 1600, 1500, 1500, 1500, 1500, 1700],

    rows,
  });
  // ================= DOCUMENT =================
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },

        children: [
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),

          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),

          new Paragraph(""),

          // Certificate No

          new Paragraph({
            children: [
              bold("Certificate No: ", 12),

              text(formData.certificateNo, 12),
            ],
          }),

          new Paragraph(""),
          new Paragraph(""),

          rightBold("Appendix – II/I", 12),

          new Paragraph(""),
          new Paragraph(""),

          centerBold(
            "Accompaniment to form for the application for Interest Subsidy under PSI – 2019",
            13,
          ),
          new Paragraph(""),
          centerBold(
            "Auditor’s Certificate for Interest Subsidy under PSI – 2019",
            14,
          ),

          new Paragraph(""),

          // ================= MAIN PARAGRAPH =================

          new Paragraph({
            children: [
              text(
                "I, hereby certify that from the examination of the Books of Accounts and other relevant records for the accounting year from ",
                12,
              ),
              new TextRun({
                text: `${getYear(formData.fromDate)} to ${getYear(formData.toDate)}`,
                bold: true,
                underline: {},
                size: 24,
              }),

              text(", of the applicant ", 12),

              new TextRun({
                text: company.nameOfCompany,
                bold: true,
                underline: {},
                size: 24,
              }),

              text(", having factory address at ", 12),

              new TextRun({
                text: company.factoryAddress,
                bold: true,
                underline: {},
                size: 24,
              }),

              text(" that the unit has paid Rs ", 12),

              new TextRun({
                text: formData.interestAmountPaid + "/-",
                bold: true,
                underline: {},
                size: 24,
              }),

              text(" (From ", 12),

              text(formattedInterestFrom, 12),

              text(" to ", 12),

              text(formattedInterestTo, 12),

              text(") as interest on loan for Fixed Capital Assets to ", 12),

              text(bank?.bankName || "", 12),

              text(" (Term Loan Account No. ", 12),

              text(bank?.accountNumber || "", 12),

              text(").", 12),
            ],
          }),

          new Paragraph(""),

          // SECOND PARAGRAPH

          new Paragraph({
            children: [
              new TextRun({
                text: "\t",
              }),

              text(
                "I hereby further certify that the figures shown herein do not include penalty, surcharge, or any other charges and are only in respect of interest paid by the eligible unit on loan for Fixed Capital Assets.",
                12,
              ),
            ],
          }),

          new Paragraph(""),

          table,

          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          // ================= FIRM =================

          rightBold("For Sarda Soni Associates LLP", 13),

          rightBold("Chartered Accountants", 12),

          right("Firm Regtn. No-117235W/W100126", 9),

          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),

          // ================= FOOTER =================

          footerLine("UDIN: ", formData.udin, formData.authorizedSignatory, 12),

          footerLine(
            "Place: ",
            formData.place,
            formData.authorizedSignatoryRole,
            12,
          ),

          footerLine(
            "Date: ",
            formattedUdinDate,
            `M. No. ${formData.membershipNo}`,
            10,
          ),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
};

// ================= HELPERS =================

function justify(value, size) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,

    children: [
      new TextRun({
        text: value || "",
        size: size * 2,
      }),
    ],
  });
}

function headerCell(value, span = 1) {
  return new TableCell({
    rowSpan: span,
    verticalAlign: "center", // ✅ IMPORTANT

    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 0,
          after: 0,
          line: 240,
        },
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

function smallHeader(value) {
  return new TableCell({
    verticalAlign: "center",

    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 0,
          after: 0,
          line: 240,
        },
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
function amountHeader(title) {
  return new TableCell({
    margins: {
      top: 60,
      bottom: 60,
      left: 40,
      right: 40,
    },

    children: [
      // Title
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 22,
          }),
        ],
      }),

      new Paragraph(""),

      // Single box (NO SPLIT)
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        layout: "fixed",

        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: "single", size: 4, color: "000000" },
                  bottom: { style: "single", size: 4, color: "000000" },
                  left: { style: "single", size: 4, color: "000000" },
                  right: { style: "single", size: 4, color: "000000" },
                },

                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "Amount",
                        bold: true,
                        size: 22,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function totalCell(value, isLastRow = false) {
  return new TableCell({
    verticalAlign: "center", // ✅ ADD THIS

    borders: isLastRow
      ? {
          bottom: { style: "double", size: 4, color: "000000" },
        }
      : {},

    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 0,
          after: 0,
          line: 240,
        },
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

function emptyCell() {
  return new TableCell({
    children: [new Paragraph("")],
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
function footerLine(label, leftValue, rightValue) {
  return new Paragraph({
    tabStops: [
      {
        type: "right",
        position: 12000, // ✅ keep SAME everywhere
      },
    ],

    children: [
      bold(label, 11),

      new TextRun({
        text: leftValue || "",
        size: 22,
      }),

      new TextRun({
        text: "\t",
      }),

      new TextRun({
        text: rightValue || "",
        bold: true,
        size: 22,
      }),
    ],
  });
}

function cell(value, alignRight = false) {
  return new TableCell({
    verticalAlign: "center", // ✅ vertical center

    margins: {
      top: 80,
      bottom: 80,
      left: 80,
      right: 80,
    },

    children: [
      new Paragraph({
        alignment: alignRight ? AlignmentType.RIGHT : AlignmentType.CENTER,

        spacing: {
          before: 0,
          after: 0,
          line: 240, // ✅ keeps text perfectly centered visually
        },

        children: [
          new TextRun({
            text: String(value ?? ""),
            size: 22,
          }),
        ],
      }),
    ],
  });
}

function getYear(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).getFullYear();
}

function formatDisplayDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
