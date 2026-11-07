import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  TabStopType,
  TabStopPosition,
} from "docx";

// ================= DATE FORMAT =================

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB");
};

// ================= MONTH TEXT =================

const formatMonthYear = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-GB", {
    month: "long",
    year: "2-digit",
  });
};

// ================= NUMBER FORMAT =================

const formatNumber = (num) => {
  if (!num) return "";
  return Number(num).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDateWithOrdinal = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date)) return "";

  const day = date.getDate();
  const year = date.getFullYear();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getOrdinal = (d) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getOrdinal(day)} ${months[date.getMonth()]} ${year}`;
};
// ================= AMOUNT FORMAT =================

const formatAmount = (num) => {
  if (!num) return "";
  return `Rs. ${formatNumber(num)}`;
};

export const generateAffidavitWord = async (data) => {
  const {
    directorName,
    directorRole,
    nameOfCompany,
    factoryAddress,

    ecNumber,
    ecDate,
    effectiveDate,

    bankName,
    loanSanctionDate,
    loanSanctionAmount,
    loanDisbursedAmount,

    msedclSanctionNumber,
    sanctionedLoad,
    loadUnit = "KW",

    place,

    interestAmountPaid,
    interestPeriodFrom,
    interestPeriodTo,

    roi,

    claimPeriodFrom,
    claimPeriodTo,

    unitsConsumed,

    electricityPeriodFrom,
    electricityPeriodTo,

    totalElectricityChargesPaid,

    date,
  } = data;

  const interestPeriodText = `${formatMonthYear(interestPeriodFrom)} to ${formatMonthYear(interestPeriodTo)}`;

  const doc = new Document({
    sections: [
      {
        children: [
          /* ================= KEEPING YOUR BLANK PARAGRAPHS ================= */

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
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),

          /* ================= TITLE ================= */

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Appendix - III",
                bold: true,
                font: "Cambria",
                size: 32,
              }),
            ],
          }),

          new Paragraph(""),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "A F F I D A V I T",
                bold: true,
                font: "Cambria",
                size: 32,
              }),
            ],
          }),

          new Paragraph(""),

          /* ================= PARAGRAPH 1 ================= */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: "I, ",
                font: "Times New Roman",
                size: 22,
              }),

              new TextRun({
                text: directorName,
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: `, ${directorRole} of `,
                font: "Times New Roman",
                size: 22,
              }),

              new TextRun({
                text: nameOfCompany,
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ", do hereby solemnly affirm and declare that in respect of the unit set up at located ",
                font: "Times New Roman",
                size: 22,
              }),

              new TextRun({
                text: factoryAddress,
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: " for which an EC No. ",
                font: "Times New Roman",
                size: 22,
              }),

              new TextRun({
                text: `${ecNumber} dated ${formatDate(ecDate)}`,
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ", with effect from date ",
                font: "Times New Roman",
                size: 22,
              }),

              new TextRun({
                text: formatDate(effectiveDate),
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: " is issued under ",
                font: "Times New Roman",
                size: 22,
              }),

              new TextRun({
                text: "PSI-2019",
                bold: true,
                font: "Times New Roman",
                size: 22,
              }),

              new TextRun({
                text: " by Joint Director of Industries Nagpur.",
                font: "Times New Roman",
                size: 22,
              }),
            ],
          }),

          new Paragraph(""),

          /* ================= PARAGRAPH 2 ================= */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: "That ",
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: bankName,
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` vide their sanction letter dated `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: formatDateWithOrdinal(loanSanctionDate),
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` have sanctioned an amount of `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: formatAmount(loanSanctionAmount),
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` towards term loan for the project for which District Industrial Centre Nagpur, has issued EC No. `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: `${ecNumber} dated ${formatDate(ecDate)}`,
                bold: true,
                font: "Times New Roman",
                size: 22,
              }),

              new TextRun({
                text: " under ",
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: "PSI 2019",
                bold: true,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: `. Out of the said sanctioned term loan amount of `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: formatAmount(loanSanctionAmount),
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` the bank has disbursed `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: formatAmount(loanDisbursedAmount),
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: `. The unit has paid interest on said loan amounting to `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: formatAmount(interestAmountPaid),
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` for the period `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: `${formatDate(interestPeriodFrom)} to ${formatDate(interestPeriodTo)} in ${interestPeriodText}`,
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` @ `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: `${roi}% p.a.`,
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` Further the unit has not / has availed any interest subsidy from institutions or under any Government of India scheme from GOI *GOM Department) on the quantum of said loan amount for the claim period from`,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: `${formatDate(claimPeriodFrom)} to ${formatDate(claimPeriodTo)}`,
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph(""),

          /* ================= PARAGRAPH 3 (FIXED EC DATE) ================= */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `That, the unit has connected load of `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: `${sanctionedLoad} ${loadUnit}`,
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` from MSEDCL vide sanction letter No. `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: msedclSanctionNumber,
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: `. The unit has consumed `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: formatNumber(unitsConsumed),
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` electricity units during the period `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: `${formatDate(electricityPeriodFrom)} to ${formatDate(electricityPeriodTo)}`,
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` for the production activities that are as per the EC No. `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: `${ecNumber} dated ${formatDate(ecDate)}`,
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: " under ",
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: "PSI-2019",
                bold: true,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: ` and has paid an amount of `,
                font: "Times New Roman",
                size: 23,
              }),

              new TextRun({
                text: formatAmount(totalElectricityChargesPaid),
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: ` to MSEDCL for the power consumed (this amount does not include any penalty towards late payment and / or any infringement of rules and regulations of MSEDCL).`,
                font: "Times New Roman",
                size: 23,
              }),
            ],
          }),

          /* ================= PARAGRAPH 4 & 5 KEPT EXACT ================= */

          new Paragraph(""),
          new Paragraph(""),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: "I undertake to repay the amount, if any, that is/will be drawn in excess of the amount admissible under the scheme together with an interest at 15 percent per annum or such other higher rate as may be prescribed by Implementing Agency from the date of disbursement of the incentive/Subsidy till the date of repayment.",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph(""),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: "Whatever stated above is true to the best of my knowledge and belief and I am aware that relying on my aforesaid statement, the Implementing Agency acting on behalf of the Government of Maharashtra have agreed to consider the incentives/subsidies which they could otherwise not have considered.",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph(""),
          new Paragraph(""),

          /* ================= PLACE + FOR SAME LINE ================= */

          // ================= SIGN =================

          // Deponent (right aligned, above For Company)
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Deponent",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          // Place (left) and For Company (right) same line

          new Paragraph({
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TabStopPosition.MAX,
              },
            ],
            children: [
              new TextRun({
                text: `Place : ${place}`,
                font: "Times New Roman",
                size: 24,
              }),

              new TextRun({
                text: "\t",
              }),

              new TextRun({
                text: `For, ${nameOfCompany}`,
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph(""),

          // Date line

          new Paragraph({
            children: [
              new TextRun({
                text: `Date : ${formatDate(date)}`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph(""),

          // Director Name (right)

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: directorName,
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          // Director Role (right)

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: directorRole,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          // Seal of Firm (right below role)
          new Paragraph(""),
          new Paragraph(""),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Seal of Firm",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          /* Remaining paragraphs unchanged */
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
};
