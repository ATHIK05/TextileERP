import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id);

    const invoice = await db.taxInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        company: true,
        party: true,
        items: true
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Generate HTML invoice and return as downloadable HTML that can be printed to PDF
    const htmlContent = generateInvoiceHTML(invoice);

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="Invoice_${invoice.invoiceNo}.html"`
      }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(invoice: any): string {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return Number(num || 0).toFixed(decimals);
  };

  const cgstRate = invoice.taxableAmount > 0 ? ((invoice.cgst / invoice.taxableAmount) * 100).toFixed(1) : '2.5';
  const sgstRate = invoice.taxableAmount > 0 ? ((invoice.sgst / invoice.taxableAmount) * 100).toFixed(1) : '2.5';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${invoice.invoiceNo}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      background: white;
      padding: 20px;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #000;
    }
    
    .header-row {
      display: flex;
      border-bottom: 1px solid #000;
    }
    
    .header-title {
      flex: 0.7;
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      padding: 8px;
      border-right: 1px solid #000;
    }
    
    .header-type {
      flex: 0.3;
      text-align: center;
      padding: 8px;
      font-size: 10px;
    }
    
    .company-section {
      text-align: center;
      padding: 15px;
      border-bottom: 1px solid #000;
    }
    
    .company-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .company-address {
      font-size: 11px;
    }
    
    .info-row {
      display: flex;
      border-bottom: 1px solid #000;
    }
    
    .info-col {
      flex: 1;
      padding: 8px 10px;
      font-size: 10px;
    }
    
    .info-col:not(:last-child) {
      border-right: 1px solid #000;
    }
    
    .invoice-details {
      display: flex;
      border-bottom: 1px solid #000;
    }
    
    .invoice-left, .invoice-right {
      flex: 1;
      padding: 10px;
    }
    
    .invoice-left {
      border-right: 1px solid #000;
    }
    
    .invoice-no {
      font-size: 12px;
      font-weight: bold;
    }
    
    .party-section {
      display: flex;
      border-bottom: 1px solid #000;
    }
    
    .party-col {
      flex: 1;
      padding: 10px;
    }
    
    .party-col:first-child {
      border-right: 1px solid #000;
    }
    
    .party-label {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .party-name {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 5px;
    }
    
    .set-details {
      display: flex;
      padding: 10px;
      border-bottom: 1px solid #000;
      font-weight: bold;
    }
    
    .set-item {
      margin-right: 30px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .items-table th {
      background: #f5f5f5;
      border: 1px solid #000;
      padding: 8px 5px;
      text-align: center;
      font-weight: bold;
      font-size: 10px;
    }
    
    .items-table td {
      border: 1px solid #000;
      padding: 8px 5px;
      vertical-align: top;
    }
    
    .items-table .text-center {
      text-align: center;
    }
    
    .items-table .text-right {
      text-align: right;
    }
    
    .summary-section {
      display: flex;
      border-top: 1px solid #000;
    }
    
    .bank-details {
      flex: 0.55;
      padding: 15px;
      border-right: 1px solid #000;
    }
    
    .bank-title {
      font-weight: bold;
      margin-bottom: 10px;
      text-decoration: underline;
    }
    
    .bank-row {
      margin-bottom: 5px;
    }
    
    .bank-label {
      display: inline-block;
      width: 100px;
    }
    
    .payment-terms {
      margin-top: 20px;
      font-weight: bold;
    }
    
    .tax-summary {
      flex: 0.45;
      padding: 10px;
    }
    
    .tax-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 10px;
      border-bottom: 1px solid #ddd;
    }
    
    .tax-row.total {
      font-weight: bold;
      font-size: 14px;
      background: #f5f5f5;
      border: 1px solid #000;
    }
    
    .amount-words {
      padding: 10px;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
    }
    
    .footer-section {
      padding: 15px;
      display: flex;
      justify-content: space-between;
    }
    
    .jurisdiction {
      font-size: 10px;
    }
    
    .for-company {
      font-weight: bold;
      text-align: right;
    }
    
    .signatures {
      display: flex;
      justify-content: space-between;
      padding: 30px 20px 15px 20px;
      border-top: 1px solid #000;
    }
    
    .signature-box {
      text-align: center;
    }
    
    .signature-line {
      border-top: 1px solid #000;
      width: 100px;
      margin: 0 auto 5px auto;
    }
    
    .eoe {
      padding: 5px 10px;
      font-size: 9px;
    }
    
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 30px;
      font-size: 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .print-btn:hover {
      background: #45a049;
    }
    
    @media print {
      .print-btn {
        display: none;
      }
      
      body {
        padding: 0;
      }
      
      .invoice-container {
        border: 2px solid #000;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  
  <div class="invoice-container">
    <!-- Header -->
    <div class="header-row">
      <div class="header-title">TAX INVOICE</div>
      <div class="header-type">ORIGINAL FOR CONSIGNEE</div>
    </div>
    
    <!-- Company Details -->
    <div class="company-section">
      <div class="company-name">${invoice.company?.name?.toUpperCase() || 'COMPANY NAME'}</div>
      <div class="company-address">${invoice.company?.address || ''}</div>
    </div>
    
    <!-- PAN, GSTIN, Contact -->
    <div class="info-row">
      <div class="info-col">
        <div>PAN : ${invoice.company?.pan || ''}</div>
        <div><strong>GSTIN : ${invoice.company?.gstin || ''}</strong></div>
        <div>Tax is Payable On Reverse Charge : NO</div>
      </div>
      <div class="info-col">
        <div>PHONE : ${invoice.company?.phone || ''}</div>
        <div>E-MAIL : ${invoice.company?.email || ''}</div>
      </div>
    </div>
    
    <!-- Invoice Details -->
    <div class="invoice-details">
      <div class="invoice-left">
        <div class="invoice-no">Invoice No    : ${invoice.invoiceNo}</div>
        <div>Invoice Date  : ${formatDate(invoice.invoiceDate)}</div>
        ${invoice.irn ? `<div style="font-size: 8px;">I.R.N : ${invoice.irn}</div>` : ''}
      </div>
      <div class="invoice-right">
        ${invoice.ackNo ? `<div>Ack.No      : ${invoice.ackNo}</div>` : ''}
        ${invoice.ackDate ? `<div>Ack.Date    : ${formatDate(invoice.ackDate)}</div>` : ''}
      </div>
    </div>
    
    <!-- Party Details -->
    <div class="party-section">
      <div class="party-col">
        <div class="party-label">Billed To</div>
        <div class="party-name">${invoice.party?.partyName?.toUpperCase() || ''}</div>
        <div>${invoice.party?.address || ''}</div>
        <div>STATE : ${invoice.party?.state || ''}, CODE : ${invoice.party?.stateCode || ''}</div>
        <div>GSTIN : ${invoice.party?.gstin || ''} &nbsp;&nbsp; PAN : ${invoice.party?.pan || ''}</div>
      </div>
      <div class="party-col">
        <div class="party-label">Delivered To</div>
        <div class="party-name">${invoice.party?.partyName?.toUpperCase() || ''}</div>
        <div>${invoice.party?.address || ''}</div>
        <div>STATE : ${invoice.party?.state || ''}, CODE : ${invoice.party?.stateCode || ''}</div>
        <div>GSTIN : ${invoice.party?.gstin || ''} &nbsp;&nbsp; PAN : ${invoice.party?.pan || ''}</div>
      </div>
    </div>
    
    <!-- Set Details -->
    <div class="set-details">
      <span class="set-item">Set No : ${invoice.setNo || ''}</span>
      <span class="set-item">Ends : ${invoice.ends || ''}</span>
      <span class="set-item">Count : ${invoice.count || ''}</span>
      <span class="set-item" style="margin-left: auto;">Meters : ${invoice.meters ? formatNumber(invoice.meters, 2) : ''}</span>
    </div>
    
    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 60px;">NO OF<br>BEAMS</th>
          <th>PARTICULARS</th>
          <th style="width: 70px;">HSN /<br>SAC</th>
          <th style="width: 90px;">QUANTITY<br>IN KGS</th>
          <th style="width: 70px;">RATE<br>/ KG</th>
          <th style="width: 100px;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item: any, index: number) => `
          <tr>
            <td class="text-center">${index + 1}</td>
            <td>${item.description || ''}</td>
            <td class="text-center">${item.hsnSac || ''}</td>
            <td class="text-right">${formatNumber(item.quantity, 3)}</td>
            <td class="text-right">${formatNumber(item.rate, 2)}</td>
            <td class="text-right">${formatNumber(item.amount, 2)}</td>
          </tr>
        `).join('')}
        ${invoice.items.length < 5 ? `
          <tr>
            <td colspan="6" style="height: ${(5 - invoice.items.length) * 25}px;"></td>
          </tr>
        ` : ''}
      </tbody>
    </table>
    
    <!-- Summary Section -->
    <div class="summary-section">
      <div class="bank-details">
        <div class="bank-title">BANK DETAIL :</div>
        <div class="bank-row"><span class="bank-label">ACCOUNT NO</span>: ${invoice.company?.bankAccount || ''}</div>
        <div class="bank-row"><span class="bank-label">BANK NAME</span>: ${invoice.company?.bankName || ''}</div>
        <div class="bank-row"><span class="bank-label">BRANCH</span>: ${invoice.company?.branch || ''}</div>
        <div class="bank-row"><span class="bank-label">IFSC</span>: ${invoice.company?.ifsc || ''}</div>
        
        <div class="payment-terms">
          PAYMENT TERMS : ${invoice.paymentTerms || '45'} Days
        </div>
      </div>
      <div class="tax-summary">
        <div class="tax-row">
          <span>TAXABLE AMOUNT</span>
          <span>${formatNumber(invoice.taxableAmount)}</span>
        </div>
        <div class="tax-row">
          <span>CGST ${cgstRate} %</span>
          <span>${formatNumber(invoice.cgst)}</span>
        </div>
        <div class="tax-row">
          <span>SGST ${sgstRate} %</span>
          <span>${formatNumber(invoice.sgst)}</span>
        </div>
        ${invoice.igst > 0 ? `
          <div class="tax-row">
            <span>IGST 5 %</span>
            <span>${formatNumber(invoice.igst)}</span>
          </div>
        ` : ''}
        <div class="tax-row">
          <span>ROUND OFF</span>
          <span>${formatNumber(invoice.roundOff)}</span>
        </div>
        <div class="tax-row total">
          <span>NET AMOUNT</span>
          <span>${formatNumber(invoice.netAmount)}</span>
        </div>
      </div>
    </div>
    
    <!-- Amount in Words -->
    <div class="amount-words">
      <strong>Rupees :</strong> ${invoice.amountInWords || ''}
    </div>
    
    <!-- Footer -->
    <div class="footer-section">
      <div class="jurisdiction">Subject to ${invoice.jurisdiction || 'CHENNIMALAI'} Jurisdiction.</div>
      <div class="for-company">For ${invoice.company?.name?.toUpperCase() || ''}</div>
    </div>
    
    <!-- Signatures -->
    <div class="signatures">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div>Prepared By</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div>Checked By</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div>Authorised Signatory</div>
      </div>
    </div>
    
    <div class="eoe">E.&O.E</div>
  </div>
</body>
</html>
  `;
}