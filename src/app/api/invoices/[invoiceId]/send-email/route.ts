import { NextResponse } from 'next/server';
import { sendInvoiceEmail } from '@/services/backendApi/invoiceService';

export async function POST(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params;

    // Call the backend API service
    const backendResponse = await sendInvoiceEmail(invoiceId);
    console.log(backendResponse)
    // Return the response from the backend to the frontend
    // Handle the standardized success or error response from the backend
    if (backendResponse.status === 'success') {
      return NextResponse.json(backendResponse, { status: 200 });
    } else if (backendResponse.status === 'error') {
      return NextResponse.json(backendResponse, { status: 500 });
    }


  } catch (error: any) {
    console.error('Error in Next.js API route for sending invoice email:', error);
    return NextResponse.json(
      { message: 'Failed to send invoice email', error: error.message },
      { status: 500 }
    );
  }
}