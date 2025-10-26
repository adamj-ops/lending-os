import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { loans, borrowers, lenders, properties, loanDocuments } from "@/db/schema";
import { LoanDocumentType } from "@/types/loan-document";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract data from wizard state
    const {
      borrower: borrowerData,
      isNewBorrower,
      property: propertyData,
      isNewProperty,
      lender: lenderData,
      isNewLender,
      loanAmount,
      interestRate,
      termMonths,
      fundedDate,
      maturityDate,
      documents,
    } = body;

    // TODO: Get organization ID from session
    const organizationId = "550e8400-e29b-41d4-a716-446655440000";

    // Create or get borrower
    let borrowerId = null;
    if (isNewBorrower && borrowerData) {
      const [newBorrower] = await db
        .insert(borrowers)
        .values({
          organizationId,
          firstName: borrowerData.firstName,
          lastName: borrowerData.lastName,
          email: borrowerData.email,
          phone: borrowerData.phone || null,
          companyName: borrowerData.companyName || null,
          creditScore: borrowerData.creditScore || null,
        })
        .returning();
      borrowerId = newBorrower.id;
    } else if (borrowerData?.id) {
      borrowerId = borrowerData.id;
    }

    // Create or get property
    let propertyId = null;
    if (isNewProperty && propertyData) {
      const [newProperty] = await db
        .insert(properties)
        .values({
          organizationId, // v2: required field
          address: propertyData.address,
          city: propertyData.city,
          state: propertyData.state,
          zip: propertyData.zip || "",
          propertyType: propertyData.propertyType || "single_family",
          purchasePrice: propertyData.purchasePrice?.toString() || "0",
        })
        .returning();
      propertyId = newProperty.id;
    } else if (propertyData?.id) {
      propertyId = propertyData.id;
    }

    // Create or get lender
    let lenderId = null;
    if (isNewLender && lenderData) {
      const [newLender] = await db
        .insert(lenders)
        .values({
          organizationId,
          name: lenderData.name,
          entityType: lenderData.entityType,
          contactEmail: lenderData.contactEmail || "",
        })
        .returning();
      lenderId = newLender.id;
    } else if (lenderData?.id) {
      lenderId = lenderData.id;
    }

    // Create loan
    const propertyAddress =
      propertyData?.address || "Address to be determined";

    const [loan] = await db
      .insert(loans)
      .values({
        organizationId,
        loanCategory: "asset_backed", // v1 wizard always creates asset-backed loans
        borrowerId,
        lenderId,
        propertyId,
        propertyAddress,
        // v2 fields (required)
        principal: loanAmount.toString(),
        rate: interestRate.toString(),
        termMonths,
        paymentType: "amortized", // v1 default
        paymentFrequency: "monthly", // v1 default
        // Backward compatibility fields
        loanAmount: loanAmount.toString(),
        interestRate: interestRate.toString(),
        status: "draft",
        statusChangedAt: new Date(),
        fundedDate: fundedDate ? new Date(fundedDate) : null,
        maturityDate: maturityDate ? new Date(maturityDate) : null,
      })
      .returning();

    // Create documents if any
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        await db.insert(loanDocuments).values({
          loanId: loan.id,
          documentType: LoanDocumentType.OTHER,
          fileName: doc.name,
          fileUrl: doc.url,
          fileSize: doc.size.toString(),
          uploadedBy: "Wizard",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        loanId: loan.id,
        borrowerId,
        propertyId,
        lenderId,
      },
    });
  } catch (error) {
    console.error("Error creating loan via wizard:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create loan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

