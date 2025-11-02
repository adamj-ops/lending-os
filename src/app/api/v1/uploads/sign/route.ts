import { NextRequest, NextResponse } from "next/server";
import { generatePresignedUrl } from "@/lib/s3-upload";
import { requireOrganization } from "@/lib/clerk-server";

export async function POST(request: NextRequest) {
  try {
    const session = await requireOrganization();
    const body = await request.json();
    const { fileName, fileType, folder } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { success: false, error: "fileName and fileType are required" },
        { status: 400 }
      );
    }

    // Generate presigned URL with organization context
    // Files will be organized by organizationId in S3
    const folderPath = folder ? `${session.organizationId}/${folder}` : session.organizationId;
    const data = await generatePresignedUrl(fileName, fileType, folderPath);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

