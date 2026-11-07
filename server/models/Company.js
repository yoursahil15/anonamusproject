import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    // 🔥 Link to client (User)
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // 🔹 Basic Info
    nameOfCompany: {
      type: String,
      required: true,
      trim: true,
    },

    pan: {
      type: String,
      required: true,
      uppercase: true,
    },

    gst: {
      type: String,
      required: true,
    },

    // iecCode: {
    //   type: String,
    //   required: true
    // },

    // 🔹 Addresses
    factoryAddress: {
      type: String,
      required: true,
    },

    registeredOfficeAddress: {
      type: String,
      required: true,
    },

    // 🔹 Certificates
    ecNumber: {
      type: String,
      required: true,
    },

    ecDate: {
      type: Date,
      required: true,
    },

    udyamNumber: {
      type: String,
      required: true,
    },

    mpcbDetails: {
      type: String,
      required: true,
    },

    // 🔹 Contact
    contactPerson: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    // 🔹 Multiple Authorized Signatories
    authorizedSignatories: [
      {
        name: {
          type: String,
          required: true,
        },

        role: {
          type: String,
          required: true,
        },

        mobileNumber: {
          type: String,
          required: true,
        },

        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // 🔹 Company Details
    dateOfIncorporation: {
      type: Date,
      required: true,
    },
    operatingPeriodFrom: {
      type: Date,
    },

    operatingPeriodTo: {
      type: Date,
    },

    operatingPeriod: {
      type: Number,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Company", companySchema);
