import { NextRequest, NextResponse } from "next/server";
import { generatePresignedUrl } from "@/lib/s3-upload";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, folder } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { success: false, error: "fileName and fileType are required" },
        { status: 400 }
      );
    }

    const data = await generatePresignedUrl(fileName, fileType, folder);

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

