import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const companies = await db.company.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validation
    const {
      name,
      gstin,
      pan,
      address,
      state,
      stateCode,
      phone,
      email,
      website,
      bankName,
      bankAccount,
      ifsc,
      branch,
    } = data;

    if (!name || !gstin) {
      return NextResponse.json(
        { error: 'Company name and GSTIN are required' },
        { status: 400 }
      );
    }

    // GSTIN validation
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid GSTIN format' },
        { status: 400 }
      );
    }

    // PAN validation (if provided)
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid PAN format' },
        { status: 400 }
      );
    }

    // Check if GSTIN already exists
    const existingCompany = await db.company.findUnique({
      where: { gstin }
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this GSTIN already exists' },
        { status: 400 }
      );
    }

    const newCompany = await db.company.create({
      data: {
        name,
        gstin,
        pan,
        address,
        state,
        stateCode,
        phone,
        email,
        website,
        bankName,
        bankAccount,
        ifsc,
        branch,
        isActive: true
      }
    });

    return NextResponse.json(newCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}