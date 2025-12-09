import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface MasterDataConfig {
  [key: string]: {
    model: any;
    defaultFields: any;
  };
}

const masterDataConfig: MasterDataConfig = {
  'count-ends': {
    model: db.count,
    defaultFields: {
      countNumber: '',
      countName: '',
      description: null,
      isActive: true
    }
  },
  'units': {
    model: db.unit,
    defaultFields: {
      unitName: '',
      unitSymbol: '',
      unitType: 'WEIGHT',
      conversionFactor: null,
      description: null,
      isActive: true
    }
  },
  'taxes': {
    model: db.tax,
    defaultFields: {
      taxName: '',
      taxType: 'CGST',
      rate: 0,
      effectiveFrom: new Date(),
      effectiveTo: null,
      isActive: true
    }
  },
  'loom-types': {
    model: db.loomType,
    defaultFields: {
      name: '',
      description: null,
      chargePerBeam: null,
      chargePerKg: null,
      isActive: true
    }
  },
  'vehicles': {
    model: db.vehicle,
    defaultFields: {
      vehicleNo: '',
      vehicleType: 'TRUCK',
      driverName: null,
      driverPhone: null,
      driverLicense: null,
      isActive: true
    }
  },
  'beams': {
    model: db.beam,
    defaultFields: {
      beamNo: '',
      beamType: '',
      grossWeight: 0,
      tareWeight: 0,
      status: 'IN',
      currentLocation: null,
      isActive: true
    }
  },
  'sizing-charges': {
    model: db.sizingCharge,
    defaultFields: {
      partyId: 0, // Required field
      chargePerKg: 0,
      chargePerBeam: 0,
      effectiveFrom: new Date(),
      effectiveTo: null,
      isActive: true
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const config = masterDataConfig[type];

    if (!config) {
      return NextResponse.json(
        { error: 'Invalid master data type' },
        { status: 400 }
      );
    }

    // Special handling for sizing-charges to include party relation
    if (type === 'sizing-charges') {
      const data = await db.sizingCharge.findMany({
        include: { party: { select: { id: true, partyName: true } } },
        orderBy: { id: 'desc' }
      });
      // Flatten partyName for frontend convenience
      const formattedData = data.map(item => ({
        ...item,
        partyName: item.party?.partyName || 'Unknown'
      }));
      return NextResponse.json(formattedData);
    }

    const data = await config.model.findMany({
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json(data);
  } catch (error) {
    const { type } = await params;
    console.error(`Error fetching ${type}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${type}` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const config = masterDataConfig[type];

    if (!config) {
      return NextResponse.json(
        { error: 'Invalid master data type' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Create new object with only allowed fields based on defaultFields keys
    const validKeys = Object.keys(config.defaultFields);

    // Helper to map known frontend variations to allowed schema keys
    // e.g. 'name' -> 'taxName' if 'taxName' exists and 'name' doesn't
    const mappedData: any = {};

    // Explicit mapping for known issues
    if (type === 'taxes' && data.name && !data.taxName) mappedData.taxName = data.name;
    if (type === 'units' && data.name && !data.unitName) mappedData.unitName = data.name;
    if (type === 'vehicles' && data.type && !data.vehicleType) mappedData.vehicleType = data.type;
    if (type === 'beams' && data.type && !data.beamType) mappedData.beamType = data.type;

    const finalData = { ...data, ...mappedData };

    // Filter out unknown keys
    const cleanData: any = {};
    for (const key of validKeys) {
      if (finalData[key] !== undefined) {
        cleanData[key] = finalData[key];
      }
    }

    const createData = { ...config.defaultFields, ...cleanData };

    // Handle date fields
    if (createData.effectiveFrom) {
      createData.effectiveFrom = new Date(createData.effectiveFrom);
    }
    if (createData.effectiveTo) {
      createData.effectiveTo = new Date(createData.effectiveTo);
    }

    const result = await config.model.create({
      data: createData
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const { type } = await params;
    console.error(`Error creating ${type}:`, error);
    return NextResponse.json(
      { error: `Failed to create ${type}` },
      { status: 500 }
    );
  }
}