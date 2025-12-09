import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const parties = await db.party.findMany({
      orderBy: {
        id: 'desc'
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            gstin: true
          }
        }
      }
    });

    return NextResponse.json(parties);
  } catch (error) {
    console.error('Error fetching parties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      companyId,
      partyName,
      gstin,
      pan,
      address,
      state,
      stateCode,
      phone,
      email,
      organizationType,
      bankName,
      bankAccount,
      ifsc,
      branch,
      noOfLooms,
      commissionPerBag,
      commissionPercent,
      dueDays,
      ledgerTypeId,
      accountGroupId,
      accountMaintenance,
      isActive
    } = data;

    // Validation
    if (!partyName || !companyId) {
      return NextResponse.json(
        { error: 'Party name and company are required' },
        { status: 400 }
      );
    }

    // Check if GSTIN already exists
    if (gstin) {
      const existingParty = await db.party.findUnique({
        where: { gstin }
      });
      if (existingParty) {
        return NextResponse.json(
          { error: 'Party with this GSTIN already exists' },
          { status: 400 }
        );
      }
    }

    const newParty = await db.party.create({
      data: {
        companyId: parseInt(companyId),
        partyName,
        gstin,
        pan,
        address,
        state,
        stateCode,
        phone,
        email,
        organizationType,
        bankName,
        bankAccount,
        ifsc,
        branch,
        noOfLooms: noOfLooms ? parseInt(noOfLooms) : null,
        commissionPerBag: commissionPerBag ? parseFloat(commissionPerBag) : null,
        commissionPercent: commissionPercent ? parseFloat(commissionPercent) : null,
        dueDays: dueDays ? parseInt(dueDays) : 45,
        ledgerTypeId: ledgerTypeId ? parseInt(ledgerTypeId) : null,
        accountGroupId: accountGroupId ? parseInt(accountGroupId) : null,
        accountMaintenance,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(newParty, { status: 201 });
  } catch (error) {
    console.error('Error creating party:', error);
    return NextResponse.json(
      { error: 'Failed to create party' },
      { status: 500 }
    );
  }
}