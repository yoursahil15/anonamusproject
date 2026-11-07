import axios from "axios";
import Bank from "../models/Bank.js";
import Company from "../models/Company.js";

// ✅ ADD BANK
export const addBank = async (req, res) => {
  try {
    const {
      companyId,
      bankType,
      ifsc,
      accountNumber,

      sanctionDateFrom,
      sanctionDateTo,
      sanctionAmount,
    } = req.body;

    // ✅ CHECK COMPANY
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        msg: "Company not found",
      });
    }

    // ✅ ONLY ONE EC ACCOUNT
    // ONLY ONE CC ACCOUNT
    if (bankType === "CC") {
      const existingCC = await Bank.findOne({
        company: companyId,
        bankType: "CC",
      });

      if (existingCC) {
        return res.status(400).json({
          msg: "Only one CC account allowed",
        });
      }
    }
    // ✅ TERM LOAN VALIDATION
    if (bankType === "TERM_LOAN") {
      if (!sanctionDateFrom || !sanctionDateTo || !sanctionAmount) {
        return res.status(400).json({
          msg: "Sanction dates and sanction amount required for Term Loan",
        });
      }
    }

    // ✅ FETCH BANK DETAILS FROM IFSC
    const response = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);

    const bankData = response.data;

    // ✅ CREATE BANK
    const bank = await Bank.create({
      company: companyId,

      bankType,

      bankName: bankData.BANK,

      accountNumber,

      ifsc,

      branchName: bankData.BRANCH,

      branchAddress: bankData.ADDRESS,

      // ✅ ONLY FOR TERM LOAN
      sanctionDateFrom: bankType === "TERM_LOAN" ? sanctionDateFrom : undefined,

      sanctionDateTo: bankType === "TERM_LOAN" ? sanctionDateTo : undefined,

      sanctionAmount: bankType === "TERM_LOAN" ? sanctionAmount : undefined,
    });

    res.status(201).json({
      msg: "Bank added successfully",
      bank,
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ✅ GET BANKS BY COMPANY
export const getBanksByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const banks = await Bank.find({
      company: companyId,
    }).sort({ createdAt: -1 });

    res.json(banks);
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};
// ✅ DELETE BANK

export const deleteBank = async (req, res) => {
  try {
    const { bankId } = req.params;

    const bank = await Bank.findById(bankId);

    if (!bank) {
      return res.status(404).json({
        msg: "Bank not found",
      });
    }

    // ✅ ONLY TERM LOAN CAN BE DELETED
    if (bank.bankType !== "TERM_LOAN") {
      return res.status(400).json({
        msg: "CC Account cannot be deleted",
      });
    }

    await Bank.findByIdAndDelete(bankId);

    res.json({
      msg: "Bank deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};
