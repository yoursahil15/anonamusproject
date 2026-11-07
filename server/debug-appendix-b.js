import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 Debug Appendix B Setup\n");

// Check 1: Template file exists
const templatePath = path.join(process.cwd(), "templates", "9. Appendix - B.xlsx");
console.log("1️⃣ Template file check:");
console.log(`   Path: ${templatePath}`);
console.log(`   Exists: ${fs.existsSync(templatePath)}`);

if (!fs.existsSync(templatePath)) {
  const alternativePath = path.join(__dirname, "templates", "9. Appendix - B.xlsx");
  console.log(`   Alt Path: ${alternativePath}`);
  console.log(`   Alt Exists: ${fs.existsSync(alternativePath)}`);
}

// Check 2: List templates directory
console.log("\n2️⃣ Templates directory contents:");
const templatesDir = path.join(process.cwd(), "templates");
try {
  const files = fs.readdirSync(templatesDir);
  files.forEach(f => console.log(`   - ${f}`));
} catch (e) {
  console.log(`   Error: ${e.message}`);
}

// Check 3: Process.cwd()
console.log(`\n3️⃣ Current working directory: ${process.cwd()}`);

// Check 4: __dirname
console.log(`4️⃣ Script directory: ${__dirname}`);

// Check 5: Environment variables
console.log("\n5️⃣ Environment variables:");
console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? "✅ Set" : "❌ Not set"}`);
console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Not set"}`);
console.log(`   AWS_REGION: ${process.env.AWS_REGION || "❌ Not set"}`);
console.log(`   AWS_S3_BUCKET_NAME: ${process.env.AWS_S3_BUCKET_NAME || "❌ Not set"}`);

// Check 6: ExcelJS module
console.log("\n6️⃣ Module check:");
try {
  const ExcelJS = await import("exceljs");
  console.log("   ExcelJS: ✅ Available");
} catch (e) {
  console.log(`   ExcelJS: ❌ ${e.message}`);
}

// Check 7: AWS SDK
console.log("\n7️⃣ AWS SDK check:");
try {
  const { S3Client } = await import("@aws-sdk/client-s3");
  console.log("   @aws-sdk/client-s3: ✅ Available");
} catch (e) {
  console.log(`   @aws-sdk/client-s3: ❌ ${e.message}`);
}

console.log("\n✅ Debug complete");
