import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id);

    const invoice = await db.taxInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        company: true,
        party: true,
        deliveredToParty: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Create PDF document
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4 size
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Helper function to add text
    const addText = (text: string, x: number, y: number, size: number = 10, isBold: boolean = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0),
      });
    };

    // Header
    addText('TAX INVOICE - ORIGINAL FOR CONSIGNEE', 200, 800, 14, true);

    // Company Details
    addText(invoice.company.name, 50, 770, 12, true);
    addText(invoice.company.address || '', 50, 755, 10);
    addText(`PAN : ${invoice.company.pan || ''}`, 50, 740, 10);
    addText(`PHONE : ${invoice.company.phone || ''}`, 50, 725, 10);
    addText(`GSTIN : ${invoice.company.gstin}`, 50, 710, 10);
    addText(`E-MAIL : ${invoice.company.email || ''}`, 50, 695, 10);
    addText('Tax is Payable On Reverse Charge : NO', 50, 680, 10);

    // Invoice Details
    addText(`Invoice No : ${invoice.invoiceNo}`, 50, 650, 10);
    addText(`Invoice Date : ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, 250, 650, 10);

    // Party Details
    addText('Billed To', 50, 620, 10, true);
    addText(invoice.party.partyName, 50, 605, 10);
    addText(invoice.party.address || '', 50, 590, 10);
    addText(`GSTIN : ${invoice.party.gstin || ''}`, 50, 575, 10);

    // Job Details (if available)
    let currentY = 550;
    if (invoice.setNo || invoice.ends || invoice.count || invoice.meters) {
      addText(`Set No : ${invoice.setNo || ''}`, 50, currentY, 10);
      addText(`Ends : ${invoice.ends || ''}`, 200, currentY, 10);
      addText(`Count : ${invoice.count || ''}`, 300, currentY, 10);
      addText(`Meters : ${invoice.meters || ''}`, 450, currentY, 10);
      currentY -= 30;
    }

    // Items Table Header
    const tableStartY = currentY - 20;
    addText('NO', 50, tableStartY, 9, true);
    addText('PARTICULARS', 90, tableStartY, 9, true);
    addText('HSN/SAC', 250, tableStartY, 9, true);
    addText('QTY', 320, tableStartY, 9, true);
    addText('RATE', 380, tableStartY, 9, true);
    addText('AMOUNT', 450, tableStartY, 9, true);

    // Items Table Data
    let itemY = tableStartY - 20;
    invoice.items.forEach((item, index) => {
      addText(`${index + 1}`, 50, itemY, 9);
      addText(item.description || '', 90, itemY, 9);
      addText(item.hsnSac || '', 250, itemY, 9);
      addText(item.quantity?.toString() || '', 320, itemY, 9);
      addText(item.rate?.toString() || '', 380, itemY, 9);
      addText(item.amount?.toString() || '', 450, itemY, 9);
      itemY -= 15;
    });

    // Totals
    const totalsY = itemY - 20;
    addText(`TAXABLE AMOUNT : ${invoice.taxableAmount?.toFixed(2) || '0.00'}`, 400, totalsY, 10);
    addText(`CGST 2.5 % : ${invoice.cgst?.toFixed(2) || '0.00'}`, 400, totalsY - 15, 10);
    addText(`SGST 2.5 % : ${invoice.sgst?.toFixed(2) || '0.00'}`, 400, totalsY - 30, 10);
    addText(`NET AMOUNT : ${invoice.netAmount?.toFixed(2) || '0.00'}`, 400, totalsY - 45, 10, true);

    // Payment Terms
    if (invoice.paymentTerms) {
      addText(`PAYMENT TERMS : ${invoice.paymentTerms}`, 50, totalsY - 70, 10);
    }

    // Signatures
    const signatureY = 200;
    addText('Prepared By', 50, signatureY, 10);
    addText('Checked By', 200, signatureY, 10);
    addText('Authorized Signatory', 350, signatureY, 10);

    // Footer
    addText('Subject to CHENNIMALAI Jurisdiction', 50, 150, 9);
    addText('E.&O.E', 50, 135, 9);

    // Generate PDF bytes
    const pdfBytes = await pdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}