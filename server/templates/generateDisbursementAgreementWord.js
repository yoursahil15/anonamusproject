import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  PageOrientation,
  TabStopType,
  TabStopPosition,
  LineRuleType,
} from "docx";

const createRun = (
  text,
  {
    bold = false,
    italics = false,
    underline = false,
    size = 22,
    font = "Times New Roman",
    breakLine = 0,
  } = {},
) => {
  const runOptions = {
    text,
    bold,
    italics,
    size,
    font,
  };

  if (underline) runOptions.underline = {};
  if (breakLine) runOptions.break = breakLine;

  return new TextRun(runOptions);
};

function yearToWords(year) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];

  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (year < 10) return ones[year];

  if (year < 20) return teens[year - 10];

  if (year < 100) {
    const t = Math.floor(year / 10);
    const o = year % 10;
    return tens[t] + (o ? " " + ones[o] : "");
  }

  // For full year like 2026 → "Two Thousand Twenty Six"
  const first = Math.floor(year / 1000); // 2
  const rest = year % 1000; // 026

  let result = "";

  if (first === 2) result += "Two Thousand";

  if (rest > 0) {
    const t = Math.floor(rest / 100);
    const lastTwo = rest % 100;

    if (t > 0) result += " " + ones[t] + " Hundred";

    if (lastTwo > 0) {
      if (lastTwo < 20) {
        result += " " + (lastTwo < 10 ? ones[lastTwo] : teens[lastTwo - 10]);
      } else {
        const tt = Math.floor(lastTwo / 10);
        const oo = lastTwo % 10;
        result += " " + tens[tt];
        if (oo) result += " " + ones[oo];
      }
    }
  }

  return result.trim();
}
function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return "";

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}
const placeholder = (value, fallback) =>
  value || value === 0 ? value : fallback;

const buildReceiptSection = (
  companyName,
  registeredOfficeAddress,
  factoryAddress,
  ecNumber,
  ecDate,
  grantAmountRs,
  grantAmountWords,
) => [
  /* ===== COMPANY NAME ===== */

  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      createRun(companyName, {
        bold: true,
        size: 32, // 16
        font: "Times New Roman",
      }),
    ],
    spacing: { after: 80 },
  }),

  /* ===== REGISTERED ADDRESS ===== */

  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      createRun(registeredOfficeAddress, {
        size: 24, // 12
        font: "Times New Roman",
      }),
    ],
    spacing: { after: 200 },
  }),

  new Paragraph(""),

  /* ===== TITLE ===== */

  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      createRun("S T A M P E D   R E C E I P T", {
        bold: true,
        underline: true,
        size: 22,
        font: "Times New Roman",
      }),
    ],
    spacing: { after: 200 },
  }),

  /* ===== NAME OF UNIT ===== */
  new Paragraph(""),
  new Paragraph({
    tabStops: [
      {
        type: TabStopType.LEFT,
        position: 3000,
      },
    ],

    children: [
      createRun("Name of the Unit"),
      createRun("\t"),
      createRun(`: ${companyName}`),
    ],

    spacing: { after: 120 },
  }),

  /* ===== ADDRESS ===== */
  new Paragraph(""),
  new Paragraph({
    children: [
      createRun("Address:", {
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
    ],
    spacing: { after: 120 },
  }),
  new Paragraph(""),
  /* ===== OFFICE ===== */

  new Paragraph({
    tabStops: [
      {
        type: TabStopType.LEFT,
        position: 3000,
      },
    ],

    children: [
      createRun("Office"),
      createRun("\t"),
      createRun(`: ${registeredOfficeAddress}`),
    ],

    spacing: { after: 120 },
  }),

  /* ===== FACTORY ===== */
  new Paragraph(""),
  new Paragraph({
    tabStops: [
      {
        type: TabStopType.LEFT,
        position: 3000,
      },
    ],

    children: [
      createRun("Factory"),
      createRun("\t"),
      createRun(`: ${factoryAddress}`, {
        size: 22, // 12
      }),
    ],

    spacing: { after: 200 },
  }),

  /* ===== EC NUMBER ===== */
  new Paragraph(""),
  new Paragraph({
    tabStops: [
      {
        type: TabStopType.LEFT,
        position: 3000,
      },
    ],

    children: [
      createRun("E.C. No. & Date", {
        bold: true,
      }),

      createRun("\t"),

      createRun(`: ${ecNumber} dated ${formatDateDDMMYYYY(ecDate)}`, {
        bold: true,
      }),
    ],

    spacing: { after: 240 },
  }),

  /* ===== RECEIVED PARAGRAPH ===== */
  new Paragraph(""),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,

    children: [
      createRun(
        "Received with thanks from the Directorate of Industries, Government of Maharashtra, a sum of Rs",
        { size: 22 },
      ),

      // ❌ NO "Rs." text
      createRun("______________", {
        size: 22,
        bold: false,
      }),

      createRun(" (Rupees", { size: 22 }),

      // ❌ NO "Rupees"
      createRun("_______________________________________________________", {
        size: 22,
        bold: false,
      }),

      createRun(
        ") through Electronic Clearance System (ECS) on account of Industrial Promotion Subsidy / Interest Subsidy / Power Tariff Subsidy as per the terms and conditions laid down in the agreement executed by us.",
        { size: 22 },
      ),
    ],

    spacing: { after: 200, line: 276 },
  }),
  new Paragraph(""),
  /* ===== CERTIFICATION ===== */

  new Paragraph({
    children: [
      createRun(
        "I certify that, I am authorized to sign this receipt, on behalf of the unit.",
      ),
    ],

    spacing: { after: 300 },
  }),

  /* ===== SIGNATURE ===== */
  new Paragraph(""),
  new Paragraph(""),
  new Paragraph(""),
  new Paragraph(""),
  new Paragraph(""),
  new Paragraph({
    alignment: AlignmentType.RIGHT, // ✅ right aligned

    children: [createRun("Stamp with signature")],

    spacing: { after: 240 },
  }),
];
export const generateDisbursementAgreementWord = async (data) => {
  const day = placeholder(data.day, "___");
  const month = placeholder(data.month, "_____");
  const yy = placeholder(data.yy, "(YY)");
  const companyName = placeholder(data.nameOfCompany, "(Name of Company)");
  const organizationType = placeholder(
    data.organizationType,
    "(Type of Organization)",
  );
  const registeredOfficeAddress = placeholder(
    data.registeredOfficeAddress,
    "(Registered Office Address)",
  );
  const factoryAddress = placeholder(
    data.factoryAddress,
    "(Factory Unit Address)",
  );
  const authorizedSignatory = placeholder(
    data.authorizedSignatory,
    "(Name of Authorized Signatory)",
  );
  const authorizedSignatoryRole = placeholder(
    data.authorizedSignatoryRole,
    "(Director/Partner/Proprietor)",
  );
  const grantAmountRs = placeholder(data.grantAmountRs, "___________");
  const grantAmountWords = placeholder(
    data.grantAmountWords,
    "_________________ _________________________________________________________",
  );
  const ecNumber = placeholder(data.ecNumber, "(EC No. and Date)");
  const ecDate = placeholder(data.ecDate, "");
  /* ✅ Format EC Date to dd.mm.yyyy */

  const ecDateFormatted = ecDate
    ? new Date(ecDate).toLocaleDateString("en-GB").replace(/\//g, ".")
    : "";
  const amountDisbursedTillDate = placeholder(
    data.amountDisbursedTillDate,
    "(Amount in Lakhs Disbursed Till Date )",
  );

  const tableRows = (data.tableRows || []).map(
    (r, i) =>
      new TableRow({
        height: {
          value: 600, // ✅ increases row height
        },

        children: [
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE }, // Sr No small
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [createRun(String(i + 1), { size: 22 })],
              }),
            ],
          }),

          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE }, // Wider
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [createRun(r.periodOfIps || "", { size: 22 })],
              }),
            ],
          }),

          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createRun(formatDateDDMMYYYY(r.dateOfSanction), { size: 22 }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [createRun(r.amountSanctioned || "", { size: 22 })],
              }),
            ],
          }),

          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [createRun(r.amountDisbursed || "", { size: 22 })],
              }),
            ],
          }),

          new TableCell({
            width: { size: 19, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createRun(formatDateDDMMYYYY(r.dateOfDisbursement), {
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
  );

  const table = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },

    rows: [
      /* HEADER ROW */

      new TableRow({
        height: {
          value: 500, // ✅ taller header
        },

        children: [
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createRun("Sr. No.", {
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createRun("Period of IPS/ Other Incentives", {
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createRun("Date of Sanction", {
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createRun("Amount Sanctioned", {
                    bold: true,
                    size: 22,
                  }),
                  createRun("(Rs. In Lakhs)", {
                    size: 22,
                    breakLine: 1,
                  }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createRun("Amount Disbursed", {
                    bold: true,
                    size: 22,
                  }),
                  createRun("(Rs. In Lakhs)", {
                    size: 22,
                    breakLine: 1,
                  }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: { size: 19, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createRun("Date of Disbursement", {
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      ...tableRows,
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: 11900,
              height: 16840,
            },
            margin: {
              top: 1248,
              right: 1440,
              bottom: 1440,
              left: 1440,
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
          new Paragraph(""),

          /* ================= HEADING ================= */

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              createRun("AGREEMENT FOR DISBURSEMENT OF INCENTIVES", {
                bold: true,
                size: 22,
                font: "Times New Roman",
              }),
            ],
          }),
          new Paragraph(""),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              createRun("(Package Scheme of Incentives 2019)", {
                size: 22,
                font: "Times New Roman",
              }),
            ],
          }),
          new Paragraph(""),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              createRun("(On Rs.100/- Stamp Paper)", {
                size: 22,
                font: "Times New Roman",
              }),
            ],
          }),

          new Paragraph(""),
          new Paragraph(""),

          /* ================= AN AGREEMENT LINE ================= */

          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              createRun("AN AGREEMENT ", {
                bold: true,
                size: 22,
              }),

              createRun(
                `made on this ${day} day of the month of ${month}, Two Thousand and ${yearToWords(yy)}.`,
                {
                  size: 22,
                },
              ),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph(""),

          /* ================= COMPANY PARAGRAPH ================= */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              createRun(companyName, {
                bold: true,
                size: 22,
              }),

              createRun(
                `, a company having its registered office at ${registeredOfficeAddress}, and its industrial unit at ${factoryAddress}, through its authorized attorney/representative `,
                { size: 22 },
              ),
              createRun(authorizedSignatory, {
                bold: true,
                size: 22,
              }),

              createRun(
                `, aged about ${placeholder(
                  data.directorAge,
                  "(Age of Director/Partner/Proprietor)",
                )} years (Hereinafter called the ENTREPRENEURS, which expression shall include its successors, legal representatives and assignees) of the `,
                { size: 22 },
              ),

              createRun("ONE PART.", {
                bold: true,
                size: 22,
              }),
            ],
            spacing: { after: 200, line: 276 },
          }),

          new Paragraph(""),

          /* ================= AND ================= */

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              createRun("AND", {
                bold: true,
                size: 22,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph(""),
          /* ================= GOVERNOR PARAGRAPH ================= */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              createRun("GOVERNOR OF MAHARASHTRA", {
                bold: true,
                size: 22,
              }),

              createRun(", hereinafter called ", { size: 22 }),

              createRun("GOVERNMENT", {
                bold: true,
                size: 22,
              }),

              createRun(
                " (which expression shall unless it repugnant to the context or meaning thereof shall include its successors and assigns) represented through its duly appointed Implementing Agency, ",
                { size: 22 },
              ),

              createRun("Directorate of Industries", {
                bold: true,
                size: 22,
              }),

              createRun(" (hereinafter called as ", { size: 22 }),

              createRun("DI", {
                bold: true,
                size: 22,
              }),

              createRun(
                "), New Administrative Building, 2nd Floor, Opp. Mantralaya, Mumbai (hereinafter called as the Implementing Agency or JDI) of the ",
                { size: 22 },
              ),

              createRun("OTHER PART.", {
                bold: true,
                size: 22,
              }),
            ],
            spacing: { after: 200, line: 276 },
          }),

          new Paragraph(""),

          /* ===== WHEREAS ===== */

          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              createRun("WHEREAS :-", {
                bold: true,
                size: 22,
              }),
            ],
          }),

          new Paragraph(""),

          /* ===== WHEREAS BODY WITH TAB ===== */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,

            children: [
              createRun(
                "The Entrepreneurs have applied to Government under the Package Scheme of Incentives 2019 as per the provisions of Government Resolution No.PSI-2019/ (CR - 46)/IND-8 dated 16th Sept. 2019 (hereinafter called as ",
                { size: 22 },
              ),

              createRun("the said scheme or 2019 Scheme", {
                bold: true,
                size: 22,
              }),

              createRun(
                ") as amended from time to time (hereinafter called as ",
                { size: 22 },
              ),

              createRun("the Modalities for IPS / other incentives", {
                bold: true,
                size: 22,
              }),

              createRun(") for Rs. ", { size: 22 }),

              createRun("____________", {
                underline: true,
                size: 22,
              }),

              createRun(" (Rs ", { size: 22 }),

              createRun("____________ _________________________________", {
                underline: true,
                size: 22,
              }),

              createRun(")", { size: 22 }),
              createRun(
                ") available as grants towards Industrial Promotion Subsidy / Interest Subsidy / Power Tariff Subsidy and capital subsidy on the already agreed terms and conditions mentioned in the Eligibility Certificate (EC) issued by ",
                { size: 22 },
              ),

              createRun("DI", {
                bold: true,
                size: 22,
              }),

              createRun(" under No. ", { size: 22 }),

              createRun(ecNumber, {
                bold: true,
                underline: true,
                size: 22,
              }),

              createRun(" dated ", { size: 22 }),

              createRun(ecDateFormatted, {
                // ✅ formatted date
                bold: true,
                underline: true,
                size: 22,
              }),

              createRun(
                " and also on the terms and conditions hereinafter mentioned.",
                { size: 22 },
              ),
            ],

            spacing: { after: 200, line: 276 },
          }),
          new Paragraph(""),

          /* ================= AGREEMENT LINE ================= */

          new Paragraph(""),

          /* ===== AGREEMENT LINE (NOT BOLD) ===== */

          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              createRun("The ENTREPRENEURS hereby agree with the GOVERNMENT", {
                size: 22,
                bold: false, // ✅ FIXED
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph(""),

          /* ===== CLAUSE 1 ===== */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              createRun(
                `1. That the Entrepreneurs have read and satisfied with the conditions of the Package Scheme of Incentive 2019 and also the terms and conditions of the sanction letter issued by DI under No ${ecNumber} ${ecDate} and the unit is in existence / normal production and in possession of all the fixed assets reported in the application or subsequent communication to DI on the date of submission of this agreement and have therefore, become entitled to the benefits under the said 2019 Scheme of the Government, pursuant to the EC granted.`,
                { size: 22 },
              ),
            ],
            spacing: { after: 200, line: 360 },
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,

            children: [
              createRun(
                "That as on the date of this agreement the following grants amounting ",
                { size: 22 },
              ),

              createRun(amountDisbursedTillDate, {
                bold: true,
                underline: true,
                size: 22,
              }),

              createRun(
                " are sanctioned and disbursable to the entrepreneur based on the various agreements executed from time to time.",
                { size: 22 },
              ),
            ],

            spacing: { after: 200, line: 276 },
          }),
          new Paragraph(""),
          table,
          new Paragraph(""),

          new Paragraph(""),
          /* ===== CLAUSE 3 ===== */

          /* ===== CLAUSE 3 ===== */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              createRun(
                "3. That the Government may direct any amount that may be outstanding due and payable by the entrepreneurs to the DI in respect of any loan or financial assistance given by the DI to the entrepreneurs, including interest and charges and expenses outstanding if any, or, any amount of incentive that may have fallen due for recovery for whatsoever reason out of that loan to be disbursed by the Government to the entrepreneurs, and, on the Government making payment of such amount to the DI, the Government shall be deemed to have been disbursed to the unit.",
                { size: 22 },
              ),
            ],
            spacing: { after: 200, line: 360 },
          }),

          /* ===== CLAUSE 4 ===== */
          new Paragraph(""),

          new Paragraph({
            children: [
              createRun("4. That the entrepreneurs shall", { size: 22 }),
            ],
          }),
          new Paragraph(""),
          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "a) Furnish to the DI information asked for by the Government from time to time.",
                { size: 22 },
              ),
            ],
          }),
          new Paragraph(""),
          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "b) Furnish to the DI periodical statement in such forms and at such intervals as may be prescribed    by the DI from time to time.",
                { size: 22 },
              ),
            ],
          }),
          new Paragraph(""),
          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "c) Furnish true copies of such documents as may be required by the DI.",
                { size: 22 },
              ),
            ],
          }),

          /* ===== CLAUSE 5 ===== */
          new Paragraph(""),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              createRun(
                "5. That in the event it is noticed, that the entrepreneurs have contravened any of the conditions of the said 2019 Scheme, as amended from time to time and / or Eligibility Certificate or sanction letter or this or Earlier Agreements, or if any declarations records earlier at the time of applying for Eligibility Certificate or grant or subsequent thereto, the entrepreneurs agree to repay forthwith on demand the entire grant of this Agreement as well of the other earlier Agreement.",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          /* ===== CLAUSE 6 ===== */

          new Paragraph(""),

          new Paragraph({
            children: [
              createRun("6. That if during the currency of the Agreement –", {
                size: 22,
              }),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "i. The entrepreneurs stop normal production for the period exceeding continuous 6 months or closes the unit altogether during the currency of the ELIGIBILITY CERTIFICATE;",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "ii. The entrepreneurs contravene any of the conditions of the Incentive Scheme or any procedure / regulations framed there under or of the ELIGIBILITY CERTIFICATE granted or sanction letter issued;",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "iii. The entrepreneurs shift the location of the unit from any place outside the underdeveloped areas or to the place outside Maharashtra State;",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "iv. The entrepreneurs make any of the following changes without obtaining previous written permission of the DI at least 30 days prior to the contemplated event namely –",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 1080 },
            children: [
              createRun(
                "a. Sell or otherwise disposes off the whole or in part or lease out wholly or in part or effect change in the ownership of the fixed assets, or alienate wholly or in part any of the fixed assets for any duration with or without consideration.",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 1080 },
            children: [
              createRun("b. Close the unit or shifts to a new location, and", {
                size: 22,
              }),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 1080 },
            children: [
              createRun(
                "c. Makes change in the name and / or the constitution.",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "v. The entrepreneurs contravene instruction or directions issued by the Government or any of its employees or by the DI or any of its employees from time to time.",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "vi. The entrepreneurs fail to submit periodical statement returns in prescribed forms as may be required by the DI.",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "vii. The entrepreneurs contravene any of the terms and conditions of any agreement already executed or any agreement that may be executed by the entrepreneurs in connection with the incentives that may be availed of.",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "viii. The entrepreneurs have obtained the grant on the basis of incorrect information furnished or untrue statements made either in the application for the Eligibility Certificates in course of proceedings for the grant of Eligibility Certificate or availing of any incentives or in this agreement or any nature whatsoever.",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          new Paragraph({
            indent: { left: 720 },
            children: [
              createRun(
                "ix. The entrepreneurs contravene any terms, conditions, provisions of this agreement, or any other agreement or Eligibility Certificate or sanction letter or any procedure framed under the said Scheme or fails to fulfill the conditions of any of the clauses of this agreement, or any other agreements. Then and in any of the aforesaid contingencies; the entrepreneurs agree to repay the whole amount immediately along with interest at any such rate as may be decided by the Government from time to time in respect of disbursement made from the date of occurrence of any of the event as mentioned above or failure to fulfill any of the conditions / instructions to the date of repayment of the amounts.",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),
          new Paragraph(""),

          /* ===== CLAUSE 7 ===== */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              createRun(
                "7. That in the event of my / our failure to pay the amount payable under clause (6), the DI on behalf of the Government shall be entitled to recover the dues as arrears of land revenue. Without prejudice this action, the DI may also take such other legal action for recovery of the dues as may be considered appropriate.",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          /* ===== CLAUSE 8 ===== */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              createRun(
                "8. That the entrepreneurs also agree that all the communications including Notices and all the other papers whatsoever posted under Certificate of posting at above stated or the last known address of the registered office of the unit shall be sufficient service of such communication, Notice and other papers whatsoever and the DI shall be entitled to proceed on the basis that the said communications, Notice and other papers have been duly received by the entrepreneurs at the end of the normal period after which such communications, Notices and other papers would ordinarily delivered by the Postal Authorities.",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),

          new Paragraph(""),

          /* ===== CLAUSE 9 ===== */

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              createRun(
                "9. The entrepreneurs shall bear and pay all costs, charges and expenses of the DI incidental to the preparation of this agreement and also for taking proceedings and actions for recovering the moneys that may be advanced along with interest and other moneys",
                { size: 22 },
              ),
            ],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          }),
          new Paragraph(""),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              createRun("IN WITNESS WHEREOF", {
                bold: true,
                size: 22,
                font: "Times New Roman",
              }),
              createRun(
                " the Entrepreneurs have hereto set their hand the day and the year first before written",
                { bold: false, size: 22, font: "Times New Roman" },
              ),
            ],
            spacing: { after: 200, line: 276 },
          }),

          new Paragraph(""),

          new Paragraph({
            children: [
              createRun(
                "Signed, sealed and delivered by the said (the Entrepreneurs)",
                { size: 22, font: "Times New Roman" },
              ),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph(""),

          /* ✅ DIRECTOR NAME WITH NUMBER + SIGN LINE */

          new Paragraph({
            tabStops: [
              {
                type: TabStopType.RIGHT, // ✅ IMPORTANT CHANGE
                position: 6000,
              },
            ],

            children: [
              createRun(`1. Shri. ${authorizedSignatory}`, {
                size: 22,
                font: "Times New Roman",
                bold: true,
              }),

              createRun("\t"), // 👈 moves cursor to right

              createRun("____________", {
                size: 22,
                font: "Times New Roman",
                bold: false,
              }),
            ],

            spacing: { after: 200 },
          }),
          new Paragraph(""),

          /* ✅ WITNESS LINE */

          new Paragraph({
            children: [
              createRun("Signed in the presence of witness:", {
                size: 22,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              createRun(
                "_____________________________________________________________",
                {
                  size: 22,
                  font: "Times New Roman",
                },
              ),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph(""),

          /* ===== DIRECTOR SIGNATURE ===== */

          /* ===== RIGHT-SIDE CURLY BRACES — INLINE AFTER TEXT ===== */

          new Paragraph({
            tabStops: [
              {
                type: TabStopType.LEFT,
                position: 7200, // ✅ fixed vertical brace column
              },
            ],
            children: [
              createRun("In the presence of,", {
                size: 22,
                font: "Times New Roman",
              }),
              createRun("\t"),
              createRun("}", {
                size: 22,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 80 },
          }),

          new Paragraph({
            tabStops: [
              {
                type: TabStopType.LEFT,
                position: 7200,
              },
            ],
            children: [
              createRun("Shri. _____________________________", {
                size: 22,
                font: "Times New Roman",
              }),
              createRun("\t"),
              createRun("}", {
                size: 22,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 80 },
          }),

          new Paragraph({
            tabStops: [
              {
                type: TabStopType.LEFT,
                position: 7200,
              },
            ],
            children: [
              createRun("Representative of Directorate of Industries", {
                size: 22,
                font: "Times New Roman",
              }),
              createRun("\t"),
              createRun("}", {
                size: 22,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 80 },
          }),

          new Paragraph({
            tabStops: [
              {
                type: TabStopType.LEFT,
                position: 7200,
              },
            ],
            children: [
              createRun("New Administrative Building,", {
                size: 22,
                font: "Times New Roman",
              }),
              createRun("\t"),
              createRun("}", {
                size: 22,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 80 },
          }),

          new Paragraph({
            tabStops: [
              {
                type: TabStopType.LEFT,
                position: 7200,
              },
            ],
            children: [
              createRun("Madam Kama Road, Opp. Mantralaya,", {
                size: 22,
                font: "Times New Roman",
              }),
              createRun("\t"),
              createRun("}", {
                size: 22,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 80 },
          }),

          new Paragraph({
            tabStops: [
              {
                type: TabStopType.LEFT,
                position: 7200,
              },
            ],
            children: [
              createRun("Mumbai – 400 032.", {
                size: 22,
                font: "Times New Roman",
              }),
              createRun("\t"),
              createRun("}", {
                size: 22,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 240 },
          }),
          /* ===== FIRST RECEIPT ===== */

          new Paragraph({
            pageBreakBefore: true, // ✅ First receipt starts new page
          }),

          ...buildReceiptSection(
            companyName,
            registeredOfficeAddress,
            factoryAddress,
            ecNumber,
            ecDate,
            grantAmountRs,
            grantAmountWords,
          ),

          /* ===== SECOND RECEIPT ===== */

          new Paragraph({
            pageBreakBefore: true, // ✅ Second receipt starts new page
          }),

          ...buildReceiptSection(
            companyName,
            registeredOfficeAddress,
            factoryAddress,
            ecNumber,
            ecDate,
            grantAmountRs,
            grantAmountWords,
          ),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
};
