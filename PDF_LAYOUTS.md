# PDF Layout Structure and Implementation Plan

## 7. PDF Layout Structure (Per Report)

### 7.1 Tax Invoice PDF Layout

```
┌─────────────────────────────────────────────────────────────┐
│ TAX INVOICE - ORIGINAL FOR CONSIGNEE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ORANGE SIZING UNIT                                          │
│ 545/1,ULAGAPURAM, , KUMARAVALASU,                          │
│ PERUNDURAI, , ERODE-638112                                  │
│ PAN : BFLPV9549C                                            │
│ PHONE :9345945190,7094421351                                │
│ GSTIN : 33BFLPV9549C1ZZ                                     │
│ E-MAIL : orangesizingunit@gmail.com                         │
│ Tax is Payable On Reverse Charge : NO                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Invoice No : SZ0975/24-25    Ack.No : 152419188704679       │
│ Invoice Date : 10/09/2024      Ack.Date : 10/09/2024         │
│ I.R.N : f99a57ad9cfe77193f0f60269bc70171e9c47ba6aee90c...   │
│                                                             │
│ Billed To                     Delivered To                   │
│ M/S.SRI SHANMUGA TEXTILES     SRI SHANMUGA TEXTILES         │
│ 4/225                         4/225                         │
│ PETHAMUCHIPALAYAM             PETHAMUCHIPALAYAM             │
│ SAMALAPURAM , Tiruppur - 641663 SAMALAPURAM , Tiruppur - 641663│
│ STATE : Tamil Nadu , CODE : 33 STATE : Tamil Nadu , CODE : 33│
│ GSTIN :33AJDPP7980L1ZN         PAN : AJDPP7980L            │
│                               GSTIN : 33AJDPP7980L1ZN      │
│                               PAN : AJDPP7980L             │
│                                                             │
│ Set No : 394A    Ends : 4080     Count : 30's vortex        │
│ Meters : 22070.00                                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ NO │ PARTICULARS                    │ HSN/SAC │ QTY   │ RATE │ AMOUNT │
│ 2  │ 4080/30's vortex - SIZING      │ 998821 │1674.7│ 19.00│31819.30│
│    │ CHARGES                        │        │      │      │        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ BANK DETAIL                                                 │
│ ACCOUNT NO : 1641223000000131                               │
│ BANK NAME : KARUR VYSYA BANK                                │
│ BRANCH : CHENNIMALAI                                        │
│ IFSC : KVBL0001641                                          │
│                                                             │
│ TAXABLE AMOUNT : 31,819.30                                  │
│ CGST 2.5 % : 795.48                                         │
│ SGST 2.5 % : 795.48                                         │
│ ROUND OFF : -0.26                                           │
│ NET AMOUNT : 33,410.00                                      │
│                                                             │
│ Rupees : Thirty Three Thousand Four Hundred And Ten Only     │
│ PAYMENT TERMS : 45 Days ( 25/10/2024 )                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Subject to CHENNIMALAI Jurisdiction                          │
│                                                             │
│ Prepared By   Checked By   Authorised Signatory             │
│                                                             │
│ E.&O.E                                                      │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Set Report (Job Card) PDF Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ORANGE SIZING UNIT                                          │
│ 545/1,ULAGAPURAM, KUMARAVALASU,                             │
│ PERUNDURAI, ERODE-638112                                    │
│ GSTIN : 33BFLPV9549C1ZZ                                     │
│                                                             │
│ SET REPORT                                                 │
│                                                             │
│ To. SRI VIPIN TEXTILE                                       │
│ Door No.1/81                                                │
│ KARANAMPETTAI                                               │
│ PALLADAM Tiruppur - 641401                                  │
│ GSTIN : 33BQIPS4885G1ZD                                     │
│                                                             │
│ Set No : 399A    Date : 11-09-2024    Loom Type : SULZER    │
│ Ends : 4800       Count : 30's vortex  Mill : Kumaragiri     │
│ Tape Length :    Beam Width : 74''     Mark :               │
│ Avg.Count : 30.78  Excess : 1.500                          │
│ WARPING - METRE : 15800.00                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ SIZING DETAILS                                              │
│ ┌─────┬──────┬─────────┬─────────┬────────┐                │
│ │ No  │ Ends │ Grs Wt  │ Net Wt  │ Breaks │                │
│ ├─────┼──────┼─────────┼─────────┼────────┤                │
│ │ 1   │ 600  │ 385.5   │ 185.5   │ 6      │                │
│ │ 2   │ 600  │ 388.5   │ 183.5   │ 5      │                │
│ │ 3   │ 600  │ 390.0   │ 182.2   │ 3      │                │
│ │ 8   │ 600  │ 386.5   │ 181.7   │ 18     │                │
│ └─────┴──────┴─────────┴─────────┴────────┘                │
│ Tot: 4800      3102.5    1459.4    39                       │
│ AVERAGE BREAKS : 0.51                                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ DELIVERY DETAILS                                            │
│ ┌─────┬─────────┬─────────┬─────────┬──────┬──────┬────────┐│
│ │ No  │ BeamNo  │ Grs Wgt │ Tr Wgt  │ NetWgt│ Pcs  │ Metre  ││
│ ├─────┼─────────┼─────────┼─────────┼──────┼──────┼────────┤│
│ │ 1   │ 2078A   │ 502.5   │ 108.5   │ 394.0 │ 0    │ 4140.00││
│ │ 2   │ 2079A   │ 484.5   │ 89.5    │ 395.0 │ 0    │ 4140.00││
│ │ 3   │ 2080A   │ 481.5   │ 89.0    │ 392.5 │ 0    │ 4140.00││
│ │ 4   │ 2081A   │ 498.5   │ 102.0   │ 396.5 │ 0    │ 4140.00││
│ └─────┴─────────┴─────────┴─────────┴──────┴──────┴────────┘│
│ Tot: 4          1967.0    389.0    1578.0  0    16560.00 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ BABY CONE DETAIL                                           │
│ ┌─────┬───────┬────────┐                                   │
│ │BAGS │ CONES │ WEIGHT │                                   │
│ ├─────┼───────┼────────┤                                   │
│ │ 3   │ 600   │ 72.700 │                                   │
│ │ 3   │ 600   │ 72.700 │                                   │
│ │     │       │ 30.600 │ (Tare Weight)                    │
│ │ 3   │ 600   │ 42.100 │                                   │
│ └─────┴───────┴────────┘                                   │
│                                                             │
│ EMPTY BEAM STOCK                                           │
│ Opening : 0    Received : 4    Consumed : -4    Closing : 0│
│ No. 975                                                     │
│                                                             │
│ YARN STOCK                                                 │
│ Opening : 0.000     RecNo.804 : 2400.000                   │
│ Total : 2400.000    Taken Yarn : 1500.000                   │
│ Balance : 900.000    Baby Yarn : 42.100                     │
│ Balance : 942.100    Pickup % : 8.13                        │
│ Elongation % : 4.81                                         │
│                                                             │
│ YARN TAKEN DETAIL                                           │
│ ┌──────┬─────────┬─────────────┬───────┬────────┐          │
│ │ TYPE │ COUNT   │ MILL NAME   │ CONES │ WEIGHT │          │
│ ├──────┼─────────┼─────────────┼───────┼────────┤          │
│ │ MILL │ 30's    │ KUMARAGIRI  │ 600   │1500.000│          │
│ └──────┴─────────┴─────────────┴───────┴────────┘          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Prepared by   Checked by   GM Sign   Authorised Sign        │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Yarn Receipt PDF Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ORANGE SIZING UNIT                                          │
│ 545/1,ULAGAPURAM, , KUMARAVALASU,                          │
│ PERUNDURAI, , ERODE-638112                                  │
│ GSTIN : 33BFLPV9549C1ZZ                                     │
│ PHONE :9345945190,7094421351                                │
│                                                             │
│ YARN RECEIPT NOTE                                          │
│                                                             │
│ From. M/S.SRI SHANMUGA TEXTILES : 823REC NO                 │
│ 4/225                                                       │
│ PETHAMUCHIPALAYAM REC.DATE : 13/09/2024 11:50 AM           │
│ SAMALAPURAM , Tiruppur - 641663                             │
│ P.DC.NO : 823                                               │
│ GSTIN NO :33AJDPP7980L1ZN                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────┬───────────┬─────────┬─────────┬──────┬───────┬──────┐ │
│ │S.NO │ MILL NAME │ LOT NO  │ COUNT   │ BAGS │ CONES │WT/CONE│ │
│ ├─────┼───────────┼─────────┼─────────┼──────┼───────┼──────┤ │
│ │ 1   │ LUCKY     │ WY-008  │ 30's    │ 100  │ 2400  │2.500 │ │
│ │     │           │         │ vortex  │      │       │      │ │
│ └─────┴───────────┴─────────┴─────────┴──────┴───────┴──────┘ │
│                                                             │
│ TOTAL 100          2400         6000.000                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Vechile No : TN56R2935                                      │
│                                                             │
│ Received By :                                              │
│                                                             │
│ Prepared By   Checked By   GM Sign   For ORANGE SIZING UNIT │
└─────────────────────────────────────────────────────────────┘
```

### 7.4 Yarn Return PDF Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ORANGE SIZING UNIT                                          │
│ GSTIN : 33BFLPV9549C1ZZ                                     │
│ 545/1,ULAGAPURAM, , KUMARAVALASU,                          │
│ PERUNDURAI, , ERODE-638112                                  │
│ PHONE :9345945190,7094421351                                │
│                                                             │
│ YARN RETURN                                                 │
│                                                             │
│ To. M/s. ASHRIYTH AUTOLOOMS                                 │
│ SF NO.389/1A KOLLANKADDU THOTTAM, THATTAMPUDUR, KANIYUR   │
│ D.C.DATE : 05/12/2025 12:20 PM                              │
│ KARUMATHAMPATTI Coimbatore - 641659                         │
│ GSTIN :33APQPN4127C1Z2                                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ┌──────┬─────────┬─────────────────┬─────────┬─────┬──────┐ │
│ │TYPE  │ SET NO  │ MILL NAME       │ COUNT   │ BAGS│ CONES │ │
│ ├──────┼─────────┼─────────────────┼─────────┼─────┼──────┤ │
│ │MILL  │ PALLAVA │ PALLAVA (PALLET)│ 30's    │ 0   │ 44    │ │
│ │      │ (PALLET)│                 │ vortex  │     │       │ │
│ └──────┴─────────┴─────────────────┴─────────┴─────┴──────┘ │
│                                                             │
│ TOTAL 0           44            134.640                      │
│                                                             │
│ NOT FOR SALE ( JOBWORK ONLY )                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Vehicle No : DIRECT                                         │
│                                                             │
│ Receivers Signature   Prepared By   Checked By   GM Sign   │
│ For ORANGE SIZING UNIT                                     │
└─────────────────────────────────────────────────────────────┘
```

### 7.5 Yarn Delivery PDF Layout

```
┌─────────────────────────────────────────────────────────────┐
│ GREEN FINE TEXTILES                                         │
│ 247, THENMUGAM VELLODE,                                     │
│ 200,KUMARAVALASU, ULAGAPURAM,                               │
│ PHONE NO : 8973509999                                       │
│ GSTIN : 33AAUFG4014A2ZU                                     │
│                                                             │
│ YARN DELIVERY                                               │
│                                                             │
│ To. PRAVIN TEXTILE                                          │
│ 3/733,ARACHALUR ROAD,                                       │
│ AMMAPALAYAM,CHENNIMALAI,ERODE-638051                        │
│ DC NO : 56                                                  │
│ DATE : 28/08/2024                                           │
│ GSTIN : 33AKKPM0480A1ZN                                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ┌───┬─────┬───────────┬─────────┬─────┬──────┬────────┐     │
│ │NO │TYPE │ MILL NAME │ COUNT   │ BAGS│ CONES│ WEIGHT │     │
│ ├───┼─────┼───────────┼─────────┼─────┼──────┼────────┤     │
│ │ 1 │ R/W │ PALLAVA   │ 30's    │ 0   │ 0    │ 719.260│     │
│ │   │     │           │ vortex  │     │      │        │     │
│ └───┴─────┴───────────┴─────────┴─────┴──────┴────────┘     │
│                                                             │
│ TOTAL 0     0      719.260    190.00    136659.40          │
│                                                             │
│ VEHICLE : TN56R2913                                         │
│                                                             │
│ TAXABLE VALUE : 136659.40                                   │
│ NOT FOR SALE (FOR JOBWORK ONLY)                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Receiver Sign   Prepared By   Checked By                   │
│ For GREEN FINE TEXTILES                                      │
└─────────────────────────────────────────────────────────────┘
```

## 8. PDF Generation Implementation

### 8.1 PDF Library Selection

**Recommended**: `pdf-lib` for Next.js integration
**Alternative**: `PDFKit` for more complex layouts

### 8.2 PDF Generation API Structure

```javascript
// PDF Generation Service
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

class PDFGenerator {
  constructor() {
    this.font = null;
    this.page = null;
    this.doc = null;
  }

  async createDocument() {
    this.doc = await PDFDocument.create();
    this.font = await this.doc.embedFont(StandardFonts.Helvetica);
    this.page = this.doc.addPage([595, 842]); // A4 size
  }

  addText(text, x, y, size = 12, options = {}) {
    this.page.drawText(text, {
      x,
      y,
      size,
      font: this.font,
      color: rgb(0, 0, 0),
      ...options
    });
  }

  addTable(headers, rows, startX, startY, columnWidths) {
    // Add table headers
    let currentX = startX;
    headers.forEach((header, index) => {
      this.addText(header, currentX, startY, 10);
      currentX += columnWidths[index];
    });

    // Add table rows
    let currentY = startY - 20;
    rows.forEach(row => {
      currentX = startX;
      row.forEach((cell, index) => {
        this.addText(cell.toString(), currentX, currentY, 9);
        currentX += columnWidths[index];
      });
      currentY -= 15;
    });
  }

  async save() {
    const pdfBytes = await this.doc.save();
    return Buffer.from(pdfBytes);
  }
}
```

### 8.3 Tax Invoice PDF Generation

```javascript
export async function generateTaxInvoicePDF(invoiceId) {
  const invoice = await db.taxInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      company: true,
      party: true,
      deliveredToParty: true,
      items: true,
      bankDetails: true
    }
  });

  const pdf = new PDFGenerator();
  await pdf.createDocument();

  // Header
  pdf.addText('TAX INVOICE - ORIGINAL FOR CONSIGNEE', 200, 800, 14, { bold: true });
  
  // Company Details
  pdf.addText(invoice.company.companyName, 50, 770, 12, { bold: true });
  pdf.addText(invoice.company.address, 50, 755, 10);
  pdf.addText(`PAN : ${invoice.company.pan}`, 50, 740, 10);
  pdf.addText(`PHONE : ${invoice.company.phone}`, 50, 725, 10);
  pdf.addText(`GSTIN : ${invoice.company.gstin}`, 50, 710, 10);
  pdf.addText(`E-MAIL : ${invoice.company.email}`, 50, 695, 10);

  // Invoice Details
  pdf.addText(`Invoice No : ${invoice.invoiceNo}`, 50, 670, 10);
  pdf.addText(`Invoice Date : ${formatDate(invoice.invoiceDate)}`, 250, 670, 10);

  // Party Details
  pdf.addText('Billed To', 50, 630, 10, { bold: true });
  pdf.addText(invoice.party.partyName, 50, 615, 10);
  pdf.addText(invoice.party.address, 50, 600, 10);
  pdf.addText(`GSTIN : ${invoice.party.gstin}`, 50, 585, 10);

  // Job Details
  pdf.addText(`Set No : ${invoice.setNo}`, 50, 550, 10);
  pdf.addText(`Ends : ${invoice.ends}`, 200, 550, 10);
  pdf.addText(`Count : ${invoice.count}`, 300, 550, 10);
  pdf.addText(`Meters : ${invoice.meters}`, 450, 550, 10);

  // Items Table
  const headers = ['NO', 'PARTICULARS', 'HSN/SAC', 'QTY', 'RATE', 'AMOUNT'];
  const columnWidths = [40, 200, 60, 60, 60, 60];
  const rows = invoice.items.map(item => [
    item.sno,
    item.description,
    item.hsnSac,
    item.quantity,
    item.rate,
    item.amount
  ]);

  pdf.addTable(headers, rows, 50, 500, columnWidths);

  // Totals
  pdf.addText(`TAXABLE AMOUNT : ${invoice.taxableAmount}`, 400, 350, 10);
  pdf.addText(`CGST 2.5 % : ${invoice.cgst}`, 400, 335, 10);
  pdf.addText(`SGST 2.5 % : ${invoice.sgst}`, 400, 320, 10);
  pdf.addText(`NET AMOUNT : ${invoice.netAmount}`, 400, 305, 10, { bold: true });

  return await pdf.save();
}
```

### 8.4 API Routes for PDF Generation

```javascript
// src/app/api/invoices/[id]/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateTaxInvoicePDF } from '@/lib/pdf-generator';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const pdfBuffer = await generateTaxInvoicePDF(parseInt(id));
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
```

### 8.5 PDF Template System

```javascript
// PDF Template Configuration
const PDF_TEMPLATES = {
  TAX_INVOICE: {
    pageSize: 'A4',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    fonts: {
      header: { size: 14, bold: true },
      normal: { size: 10 },
      small: { size: 8 }
    },
    sections: [
      { type: 'header', y: 800 },
      { type: 'company', y: 770 },
      { type: 'invoice_details', y: 670 },
      { type: 'party_details', y: 630 },
      { type: 'job_details', y: 550 },
      { type: 'items_table', y: 500 },
      { type: 'totals', y: 350 },
      { type: 'signatures', y: 200 }
    ]
  },
  SET_REPORT: {
    pageSize: 'A4',
    orientation: 'portrait',
    // ... similar configuration for set report
  }
};
```

This comprehensive PDF layout specification provides exact positioning and formatting for all report types, ensuring consistent and professional output that matches the existing document formats.