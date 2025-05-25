import { NextRequest, NextResponse } from "next/server";
import { sendInvoiceEmail } from "@/services/backendApi/invoiceService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const { invoiceId } = await params;

    const backendResponse = await sendInvoiceEmail(invoiceId);
    console.log(backendResponse);

    if (backendResponse.status === "success") {
      return NextResponse.json(backendResponse, { status: 200 });
    } else if (backendResponse.status === "error") {
      return NextResponse.json(backendResponse, { status: 500 });
    }

    return NextResponse.json(
      { message: "Unexpected response from backend" },
      { status: 500 },
    );
  } catch (error: any) {
    console.error(
      "Error in Next.js API route for sending invoice email:",
      error,
    );
    return NextResponse.json(
      { message: "Failed to send invoice email", error: error.message },
      { status: 500 },
    );
  }
}
