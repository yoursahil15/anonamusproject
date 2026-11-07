import express from "express";
import {
  addBank,
  getBanksByCompany,
  deleteBank,
} from "../controllers/bankController.js";

const router = express.Router();

// ✅ Add Bank
router.post("/add", addBank);

router.delete("/:bankId", deleteBank);

// ✅ Get All Banks By Company
router.get("/company/:companyId", getBanksByCompany);

export default router;
