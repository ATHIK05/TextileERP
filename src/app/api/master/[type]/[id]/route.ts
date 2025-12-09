import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const masterDataConfig: { [key: string]: { model: any, defaultFields?: any } } = {
  'count-ends': { model: db.count },
  'units': { model: db.unit },
  'taxes': { model: db.tax },
  'loom-types': { model: db.loomType },
  'vehicles': { model: db.vehicle },
  'beams': { model: db.beam },
  'sizing-charges': { model: db.sizingCharge },
  'delivery-places': { model: db.deliveryPlace }
};

// Config for field mapping (mirrors POST logic)
const fieldMappings: { [key: string]: { [key: string]: string } } = {
  'taxes': { 'name': 'taxName', 'percentage': 'rate' },
  'units': { 'name': 'unitName' },
  'vehicles': { 'type': 'vehicleType' },
  'beams': { 'type': 'beamType' }
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string, id: string }> }
) {
  try {
    const { type, id: idParam } = await params;
    const id = parseInt(idParam);
    const config = masterDataConfig[type];

    if (!config) {
      return NextResponse.json(
        { error: 'Invalid master data type' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Map fields if necessary
    const mappings = fieldMappings[type];
    if (mappings) {
      Object.keys(mappings).forEach(oldKey => {
        if (data[oldKey] !== undefined && data[mappings[oldKey]] === undefined) {
          data[mappings[oldKey]] = data[oldKey];
          delete data[oldKey];
        }
      });
    }

    // Handle date fields
    if (data.effectiveFrom) {
      data.effectiveFrom = new Date(data.effectiveFrom);
    }
    if (data.effectiveTo) {
      data.effectiveTo = new Date(data.effectiveTo);
    }

    // Handle status -> isActive conversion if needed
    if (data.status !== undefined && data.isActive === undefined) {
      if (data.status === 'ACTIVE') data.isActive = true;
      else if (data.status === 'INACTIVE') data.isActive = false;
      // Remove status if model doesn't have it (most don't, they have isActive)
      // But 'beams' has 'status' (IN/OUT), so be careful.
      // Only map if we are sure? 
      // Start strictly: specifically for delivery-places or check model fields?
      // For now, let's stick to what frontend sends. Frontend sends isActive for most.
      // If issues arise, I'll add specific logic.
    }

    // Explicitly handle delivery-places field mapping if needed - currently identity mapping is fine for placeName
    if (type === 'delivery-places') {
      // Ensure companyId is not wiped or handled if passed null?
      // Update usually valid.
      if (data.name && !data.placeName) {
        data.placeName = data.name;
        delete data.name;
      }
    }

    // Remove ID if present in body to avoid Prisma errors (though update ignores it usually, better safe)
    delete data.id;

    const result = await config.model.update({
      where: { id },
      data
    });

    return NextResponse.json(result);
  } catch (error) {
    const { type } = await params;
    console.error(`Error updating ${type}:`, error);
    return NextResponse.json(
      { error: `Failed to update ${type}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string, id: string }> }
) {
  try {
    const { type, id: idParam } = await params;
    const id = parseInt(idParam);
    const config = masterDataConfig[type];

    if (!config) {
      return NextResponse.json(
        { error: 'Invalid master data type' },
        { status: 400 }
      );
    }

    await config.model.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    const { type } = await params;
    console.error(`Error deleting ${type}:`, error);
    return NextResponse.json(
      { error: `Failed to delete ${type}` },
      { status: 500 }
    );
  }
}