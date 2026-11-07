import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

// ================= HELPERS =================
const formatDateLong = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

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

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

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

  return `${month} ${day}${getOrdinal(day)}, ${year}`;
};
const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return date.toLocaleDateString("en-IN");
};

const formatOperatingPeriod = (fromDate, toDate, fallback) => {
  if (fromDate && toDate) {
    return `${formatDate(fromDate)} to ${formatDate(toDate)}`;
  }
  return fallback || "";
};

// ================= MAIN FUNCTION =================

export const generateCoveringWord = async (company, input = {}) => {
  try {
    const data = typeof input === "string" ? { dateOfLetter: input } : input;

    // ================= SAFE DATA =================

    const companyName = data.nameOfCompany || company.nameOfCompany || "";
    const registeredOfficeAddress =
      data.registeredOfficeAddress || company.registeredOfficeAddress || "";

    const currentDate = formatDate(data.dateOfLetter) || formatDate(new Date());
    const letterDate =
      formatDateLong(data.dateOfLetter) || formatDateLong(new Date());
    const authorityType =
      data.authorityType ||
      "District Industries Centre / Joint Director of Industries";

    const operatingPeriod = formatOperatingPeriod(
      data.fromDate,
      data.toDate,
      data.operatingPeriod || company.operatingPeriod,
    );

    const ecNumber = data.ecNumber || company.ecNumber || "";
    const formattedEcDate = formatDate(data.ecDate || company.ecDate);

    const psiYear = data.psiYear || "";
    const financialYear = data.financialYear || "";

    const signatoryName =
      data.authorizedSignatory || company.authorizedSignatory || "";

    const signatoryRole =
      data.authorizedSignatoryRole || company.signatoryRole || "";
    // ================= DOCUMENT =================

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              size: 22,
            },
          },
        },
      },

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
            // ================= HEADER =================

            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: companyName,
                  bold: true,
                  size: 32,
                  underline: {},
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Regd Add : ${registeredOfficeAddress}`,
                  size: 24,
                }),
              ],
            }),

            new Paragraph({
              text: "",
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 12,
                  color: "000000",
                },
              },
              spacing: { after: 200 },
            }),

            // ================= DATE =================

            new Paragraph({
              children: [
                new TextRun({
                  text: letterDate,
                  size: 22,
                }),
              ],
            }),
            new Paragraph(""),

            // ================= ADDRESS =================
            new Paragraph({
              children: [
                new TextRun({
                  text: "General Manager",
                  bold: true,
                }),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: authorityType,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Udyog Bhawan,",
                  bold: true,
                }),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Nagpur.",
                  bold: true,
                }),
              ],
            }),
            new Paragraph(""),

            // ================= SUBJECT =================

            new Paragraph({
              children: [
                new TextRun({
                  text: "SUBJECT: ",
                  bold: true,
                  underline: {},
                }),
                new TextRun({
                  text: `Application for Claim of Subsidies under PSI - ${psiYear} for FY ${financialYear}`,
                }),
              ],
            }),

            // ================= REF =================

            new Paragraph({
              children: [
                new TextRun({
                  text: "REF: ",
                  bold: true,
                  underline: {},
                }),
                new TextRun({
                  text: `EC No: ${ecNumber} dated ${formattedEcDate}`,
                  size: 22,
                }),
              ],
            }),
            new Paragraph(""),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Dear Sir,",
                }),
              ],
            }),

            new Paragraph(""),

            // ================= BODY =================

            new Paragraph({
              children: [
                new TextRun({
                  text: `Please find enclosed herewith application form for Incentive under PSI – ${psiYear} along with following documents:`,
                }),
              ],
            }),

            new Paragraph(""),

            // ================= LIST =================

            ...[
              "Appendix A",
              "Cancelled Cheque",
              "Disbursement Agreement",
              "Stamped Receipt",
              "New Affidavit in appendix III",
              "Application Form for Claim of Interest Subsidy – Appendix – ‘C’",
              "Auditor’s Certificate for Interest Subsidy – Appendix – II/I",
              "Interest Certificate from Term Lending Bank",
              "Application Form for Claim of Power Subsidy – Appendix – ‘B’",
              "Auditor’s Certificate for Power Subsidy – Appendix – II/H",
              "Electricity Bills",
              "ELP Form",
              "Production Extract",
              "Balance Sheet",
            ].map(
              (item, i) =>
                new Paragraph({
                  text: `${i + 1}. ${item}`,
                  indent: { left: 360 },
                }),
            ),

            new Paragraph(""),
            new Paragraph("Thanking You,"),
            new Paragraph(""),
            new Paragraph("Yours Faithfully,"),

            new Paragraph({
              children: [
                new TextRun({
                  text: companyName,
                  bold: true,
                }),
              ],
            }),

            new Paragraph(""),

            new Paragraph({
              children: [
                new TextRun({
                  text: signatoryName,
                  bold: true,
                }),
              ],
            }),

            new Paragraph(signatoryRole),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error("❌ Covering Template Error:", error);
    throw error;
  }
};
