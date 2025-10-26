import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3-client";

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

export interface PresignedUrlData {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

/**
 * Generate a presigned URL for direct upload to S3
 */
export async function generatePresignedUrl(
  fileName: string,
  fileType: string,
  folder: string = "uploads"
): Promise<PresignedUrlData> {
  const timestamp = Date.now();
  const fileKey = `${folder}/${timestamp}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

  return {
    uploadUrl,
    fileKey,
    publicUrl,
  };
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  await s3Client.send(command);
}

/**
 * Extract file key from S3 URL
 */
export function extractFileKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    return pathParts.slice(1).join("/"); // Remove leading slash
  } catch {
    return null;
  }
}

