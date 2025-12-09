import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const ledgerTypes = await db.ledgerType.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(ledgerTypes);
  } catch (error) {
    console.error('Error fetching ledger types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ledger types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, description } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'Ledger type name is required' },
        { status: 400 }
      );
    }

    // Check if ledger type already exists
    const existingType = await db.ledgerType.findUnique({
      where: { name }
    });

    if (existingType) {
      return NextResponse.json(
        { error: 'Ledger type with this name already exists' },
        { status: 400 }
      );
    }

    const newLedgerType = await db.ledgerType.create({
      data: {
        name,
        description: description || '',
        isActive: true
      }
    });

    return NextResponse.json(newLedgerType);
  } catch (error) {
    console.error('Error creating ledger type:', error);
    return NextResponse.json(
      { error: 'Failed to create ledger type' },
      { status: 500 }
    );
  }
}