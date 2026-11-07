import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import getS3Client from "../config/s3.js";

/**
 * Generate a unique storage file name with timestamp
 * @param {string} originalFileName - Original file name
 * @param {string} documentType - Type of document (COVERING_LETTER, POWER_SUBSIDY, etc.)
 * @returns {string} Generated unique file name
 */
export const generateStorageFileName = (originalFileName, documentType) => {
  const timestamp = Date.now();
  const extension = path.extname(originalFileName);
  const baseName = path.basename(originalFileName, extension);
  return `${baseName}-${timestamp}${extension}`;
};

/**
 * Upload file to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} companyId - Company ID for organizing files
 * @param {string} mimeType - File MIME type
 * @returns {Promise<Object>} Object with s3Key, s3Url, s3Bucket, fileSize
 */
export const uploadFileToS3 = async (buffer, fileName, companyId, mimeType) => {
  try {
    console.log(`📤 Starting S3 upload for: ${fileName}`);
    
    const s3Client = getS3Client();
    const bucket = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    if (!bucket) {
      throw new Error("AWS_S3_BUCKET_NAME environment variable not set");
    }

    if (!region) {
      throw new Error("AWS_REGION environment variable not set");
    }

    // Generate unique file name
    const uniqueFileName = generateStorageFileName(fileName, "document");

    // Create S3 key with folder structure: generated-documents/companyId/fileName
    const s3Key = `generated-documents/${companyId}/${uniqueFileName}`;

    console.log(`   Bucket: ${bucket}`);
    console.log(`   Key: ${s3Key}`);
    console.log(`   Size: ${buffer.length} bytes`);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: mimeType,
      Metadata: {
        "original-name": fileName,
        "company-id": companyId,
        "upload-date": new Date().toISOString(),
      },
    });

    const response = await s3Client.send(command);

    // Generate public URL
    const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

    console.log(`✅ File uploaded to S3: ${s3Key}`);

    return {
      success: true,
      fileName: uniqueFileName,
      originalFileName: fileName,
      s3Key,
      s3Url,
      s3Bucket: bucket,
      fileSize: buffer.length,
      mimeType,
      eTag: response.ETag,
    };
  } catch (error) {
    console.error("❌ S3 Upload Error:", {
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      fileName,
      companyId
    });
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Download file from S3
 * @param {string} s3Key - S3 object key
 * @returns {Promise<Buffer>} File buffer
 */
export const downloadFileFromS3 = async (s3Key) => {
  try {
    const s3Client = getS3Client();
    const bucket = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;

    if (!bucket) {
      throw new Error("AWS_BUCKET_NAME environment variable not set");
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const chunks = [];

    // Convert stream to buffer
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    console.log(`✅ File downloaded from S3: ${s3Key}`);

    return buffer;
  } catch (error) {
    console.error("❌ S3 Download Error:", error.message);
    throw new Error(`Failed to download file from S3: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {string} s3Key - S3 object key
 * @returns {Promise<void>}
 */
export const deleteFileFromS3 = async (s3Key) => {
  try {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const s3Client = getS3Client();
    const bucket = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;

    if (!bucket) {
      throw new Error("AWS_BUCKET_NAME environment variable not set");
    }

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    await s3Client.send(command);

    console.log(`✅ File deleted from S3: ${s3Key}`);
  } catch (error) {
    console.error("❌ S3 Delete Error:", error.message);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

/**
 * Check if file exists in S3
 * @param {string} s3Key - S3 object key
 * @returns {Promise<boolean>}
 */
export const fileExistsInS3 = async (s3Key) => {
  try {
    const s3Client = getS3Client();
    const bucket = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;

    if (!bucket) {
      throw new Error("AWS_BUCKET_NAME environment variable not set");
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === "NoSuchKey") {
      return false;
    }
    console.error("❌ S3 Check Error:", error.message);
    return false;
  }
};
