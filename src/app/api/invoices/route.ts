import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const invoices = await db.taxInvoice.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            gstin: true
          }
        },
        party: {
          select: {
            id: true,
            partyName: true,
            gstin: true
          }
        },
        items: true
      },
      orderBy: {
        invoiceDate: 'desc'
      }
    });

    const formattedInvoices = invoices.map(invoice => ({
      ...invoice,
      companyName: invoice.company.name,
      partyName: invoice.party.partyName
    }));

    return NextResponse.json(formattedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      companyId,
      partyId,
      setNo,
      count,
      ends,
      meters,
      paymentTerms,
      items,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      roundOff,
      netAmount,
      taxType,
      taxRate
    } = data;

    // Validate required fields
    if (!companyId || !partyId) {
      return NextResponse.json(
        { error: 'Company and Party are required' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceNo = await generateInvoiceNumber();

    // Convert amount to words
    const amountInWords = convertNumberToWords(Math.round(netAmount));

    // Create invoice with items
    const invoice = await db.taxInvoice.create({
      data: {
        invoiceNo,
        invoiceDate: new Date(),
        companyId: parseInt(companyId),
        partyId: parseInt(partyId),
        setNo: setNo || null,
        count: count || null,
        ends: ends ? parseInt(ends) : null,
        meters: meters ? parseFloat(meters) : null,
        taxableAmount: parseFloat(taxableAmount) || 0,
        cgst: parseFloat(cgstAmount) || 0,
        sgst: parseFloat(sgstAmount) || 0,
        igst: parseFloat(igstAmount) || 0,
        roundOff: parseFloat(roundOff) || 0,
        netAmount: parseFloat(netAmount) || 0,
        amountInWords,
        paymentTerms: String(paymentTerms || '45'),
        jurisdiction: 'CHENNIMALAI',
        items: {
          create: items.map((item: any, index: number) => ({
            sNo: index + 1,
            description: item.particulars,
            hsnSac: item.hsnSac || '998821',
            quantity: parseFloat(item.quantity) || 0,
            rate: parseFloat(item.rate) || 0,
            amount: parseFloat(item.amount) || 0
          }))
        }
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            gstin: true
          }
        },
        party: {
          select: {
            id: true,
            partyName: true,
            gstin: true
          }
        },
        items: true
      }
    });

    const formattedInvoice = {
      ...invoice,
      companyName: invoice.company.name,
      partyName: invoice.party.partyName
    };

    return NextResponse.json(formattedInvoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

async function generateInvoiceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const yearRange = `${currentYear.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;

  // Find the last invoice for this year range
  // Find the last invoice for this year range
  const lastInvoice = await db.taxInvoice.findFirst({
    where: {
      invoiceNo: {
        startsWith: 'SZ'
      }
    },
    orderBy: {
      id: 'desc' // Use ID desc or invoiceNo desc if consistent
    }
  });

  let sequence = 1;
  if (lastInvoice) {
    const match = lastInvoice.invoiceNo.match(/SZ(\d+)\/\d{2}-\d{2}/);
    if (match) {
      sequence = parseInt(match[1]) + 1;
    }
  }

  return `SZ${String(sequence).padStart(4, '0')}/${yearRange}`;
}

function convertNumberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';

  const convertLessThanThousand = (n: number): string => {
    let result = '';

    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }

    if (n >= 10) {
      result += teens[n - 10] + ' ';
    } else if (n > 0) {
      result += ones[n] + ' ';
    }

    return result.trim();
  };

  let result = '';

  if (num >= 100000) {
    result += convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }

  if (num >= 1000) {
    result += convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }

  if (num > 0) {
    result += convertLessThanThousand(num);
  }

  return result.trim() + ' Only';
}