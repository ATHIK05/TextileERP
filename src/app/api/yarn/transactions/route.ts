import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch from all three tables and combine
    const [receipts, returns, deliveries] = await Promise.all([
      db.yarnReceipt.findMany({
        include: { party: true, items: true },
        orderBy: { receiptDate: 'desc' }
      }),
      db.yarnReturn.findMany({
        include: { party: true, items: true },
        orderBy: { dcDate: 'desc' }
      }),
      db.yarnDelivery.findMany({
        include: { party: true, items: true },
        orderBy: { date: 'desc' }
      })
    ]);

    // Normalize and combine
    const formattedReceipts = receipts.map(r => ({
      id: r.id,
      transactionNo: r.receiptNo,
      date: r.receiptDate,
      type: 'RECEIPT',
      partyName: r.party.partyName,
      vehicleNo: null, // access vehicle relation if needed
      totalBags: r.totalBags,
      totalCones: r.totalCones,
      totalWeight: r.totalWeight,
      status: 'COMPLETED'
    }));

    const formattedReturns = returns.map(r => ({
      id: r.id,
      transactionNo: r.dcNo,
      date: r.dcDate,
      type: 'RETURN',
      partyName: r.party.partyName, // Party relation exists
      vehicleNo: null,
      totalBags: r.totalBags,
      totalCones: r.totalCones,
      totalWeight: r.totalWeight,
      status: 'COMPLETED'
    }));

    const formattedDeliveries = deliveries.map(d => ({
      id: d.id,
      transactionNo: d.dcNo,
      date: d.date,
      type: 'DELIVERY',
      partyName: d.party.partyName,
      totalBags: d.totalBags,
      totalCones: d.totalCones,
      totalWeight: d.totalWeight,
      status: 'COMPLETED'
    }));

    const allTransactions = [...formattedReceipts, ...formattedReturns, ...formattedDeliveries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(allTransactions);
  } catch (error) {
    console.error('Error fetching yarn transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, partyId, vehicleNo, dcNo, remarks, items, totalBags, totalCones, totalWeight, totalAmount } = data;

    // Check for company (required relation)
    const company = await db.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 400 });
    }

    let result;

    if (type === 'RECEIPT') {
      const receiptNo = await generateTransactionNumber('RECEIPT');
      result = await db.yarnReceipt.create({
        data: {
          receiptNo,
          receiptDate: new Date(),
          companyId: company.id,
          partyId: parseInt(partyId),
          // vehicleId: ... map vehicleNo to Id if possible, or ignore for now
          totalBags: totalBags || 0,
          totalCones: totalCones || 0,
          totalWeight: totalWeight || 0,
          items: {
            create: items.map((item: any) => ({
              millName: item.millName,
              count: item.count,
              lotNo: item.lotNo,
              bags: item.bags || 0,
              cones: item.cones || 0,
              weight: item.weight || 0,
            }))
          }
        }
      });

      // Create YarnStockTransaction (Ledger)
      await db.yarnStockTransaction.create({
        data: {
          yarnReceiptId: result.id,
          type: 'IN',
          qtyKg: totalWeight || 0,
          notes: `Receipt from Party ${partyId}`
        }
      });

    } else if (type === 'RETURN') {
      // Assuming DC No is provided or generated
      const actualDcNo = dcNo || await generateTransactionNumber('RETURN');
      result = await db.yarnReturn.create({
        data: {
          dcNo: actualDcNo,
          dcDate: new Date(),
          companyId: company.id,
          partyId: parseInt(partyId),
          totalBags: totalBags || 0,
          totalCones: totalCones || 0,
          totalWeight: totalWeight || 0,
          notes: remarks,
          items: { // matching yarnReturnItem schema
            create: items.map((item: any) => ({
              type: item.type, // e.g. Cone, Bag
              millName: item.millName,
              count: item.count,
              bags: item.bags,
              cones: item.cones,
              weight: item.weight
            }))
          }
        }
      });

      await db.yarnStockTransaction.create({
        data: {
          yarnReturnId: result.id,
          type: 'OUT',
          qtyKg: totalWeight || 0,
          notes: `Return to Party ${partyId}`
        }
      });

    } else if (type === 'DELIVERY') {
      const actualDcNo = dcNo || await generateTransactionNumber('DELIVERY');
      result = await db.yarnDelivery.create({
        data: {
          dcNo: actualDcNo,
          date: new Date(),
          companyId: company.id,
          partyId: parseInt(partyId),
          totalBags: totalBags || 0,
          totalCones: totalCones || 0,
          totalWeight: totalWeight || 0,
          totalAmount: totalAmount || 0,
          items: {
            create: items.map((item: any) => ({
              millName: item.millName,
              count: item.count,
              bags: item.bags,
              cones: item.cones,
              weight: item.weight,
              rate: item.rate,
              amount: item.amount
            }))
          }
        }
      });

      await db.yarnStockTransaction.create({
        data: {
          yarnDeliveryId: result.id,
          type: 'OUT',
          qtyKg: totalWeight || 0,
          notes: `Delivery to Party ${partyId}`
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error creating yarn transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

async function generateTransactionNumber(type: string): Promise<string> {
  const prefix = type === 'RECEIPT' ? 'YR' : type === 'RETURN' ? 'YRT' : 'YD';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
}