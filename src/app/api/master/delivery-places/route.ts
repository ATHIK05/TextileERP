import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const deliveryPlaces = await db.deliveryPlace.findMany({
      orderBy: {
        placeName: 'asc'
      }
    });

    return NextResponse.json(deliveryPlaces);
  } catch (error) {
    console.error('Error fetching delivery places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery places' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, placeName, address, city, state, pinCode, contactPerson, contact, phone, status, isActive } = data;

    // Combine address parts if needed, or just use what we have matching schema
    // Schema: placeName, address, contact, phone, isActive

    // Construct address from components if provided, else use address field
    let fullAddress = address;
    if (city || state || pinCode) {
      fullAddress = [address, city, state, pinCode].filter(Boolean).join(', ');
    }

    // Fetch default company (assuming single tenant or similar context for this fix)
    const firstCompany = await db.company.findFirst();
    // Use company from payload if present, otherwise default to first available company
    const companyId = data.companyId ? parseInt(data.companyId) : (firstCompany?.id);

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required and no default company found' },
        { status: 400 }
      );
    }

    const deliveryPlace = await db.deliveryPlace.create({
      data: {
        placeName: placeName || name,
        companyId, // Add companyId
        address: fullAddress || null,
        contact: contact || contactPerson || null, // Map contactPerson to contact
        phone: phone || null,
        isActive: isActive !== undefined ? isActive : (status === 'ACTIVE') // Map status string to boolean
      }
    });

    return NextResponse.json(deliveryPlace, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery place:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery place' },
      { status: 500 }
    );
  }
}