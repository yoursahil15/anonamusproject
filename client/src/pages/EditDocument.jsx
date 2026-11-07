import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../services/api";

import CoveringLetterForm from "./forms/CoveringLetterForm";
import PowerSubsidyForm from "./forms/PowerSubsidyForm";
import InterestSubsidyForm from "./forms/InterestSubsidyForm";
import AffidavitForm from "./forms/AffidavitForm";
import ElpForm from "./forms/ElpForm";
import ProductionExtractForm from "./forms/ProductionExtractForm";
import DisbursementAgreement from "./forms/DisbursementAgreement";
import AppendixAForm from "./forms/AppendixAForm";
import AppendixBForm from "./forms/AppendixBForm";
import AppendixCForm from "./forms/AppendixCForm";
import BankInterestForm from "./forms/BankInterestForm";

export default function EditDocument() {
const { documentId } = useParams();

const [document, setDocument] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
const loadDocument = async () => {
try {
const res = await API.get(
`/documents/generated/${documentId}`
);


    setDocument(res.data);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

loadDocument();


}, [documentId]);

if (loading) {
return <div className="p-6">Loading...</div>;
}

if (!document) {
return <div className="p-6">Document not found</div>;
}

switch (document.documentType) {
case "COVERING_LETTER":
return ( <CoveringLetterForm
       editMode={true}
       documentId={documentId}
       existingDocument={document}
     />
);


case "POWER_SUBSIDY":
  return (
    <PowerSubsidyForm
      editMode={true}
      documentId={documentId}
      existingDocument={document}
    />
  );

case "INTEREST_SUBSIDY":
  return (
    <InterestSubsidyForm
      editMode={true}
      documentId={documentId}
      existingDocument={document}
    />
  );

case "BANK_INTEREST_CERTIFICATE":
  return (
    <BankInterestForm
      editMode={true}
      documentId={documentId}
      existingDocument={document}
    />
  );

case "AFFIDAVIT":
  return (
    <AffidavitForm
      editMode={true}
      documentId={documentId}
      existingDocument={document}
    />
  );

case "ELP_FORM":
  return (
    <ElpForm
      editMode={true}
      documentId={documentId}
      existingDocument={document}
    />
  );

case "PRODUCTION_EXTRACT":
  return (
    <ProductionExtractForm
      editMode={true}
      documentId={documentId}
      existingDocument={document}
    />
  );

case "DISBURSEMENT_AGREEMENT":
  return (
    <DisbursementAgreement
      editMode={true}
      documentId={documentId}
      existingDocument={document}
    />
  );

case "APPENDIX_A":
  return (
    <AppendixAForm
      editMode={true}
      documentId={documentId}
      existingDocument={document}
    />
  );

case "APPENDIX_B":
  return (
    <AppendixBForm
      editMode={true}
      documentId={documentId}
      existingDocument={document}
    />
  );

case "APPENDIX_C":
  return (
    <AppendixCForm
      editMode={true}
      documentId={documentId}
      existingDocument={document}
    />
  );

default:
  return (
    <div className="p-6">
      Edit not implemented for this document type
    </div>
  );


}
}
