import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all sizing charges with party details
export async function GET() {
    try {
        const sizingCharges = await db.sizingCharge.findMany({
            where: {
                isActive: true,
            },
            include: {
                party: {
                    select: {
                        id: true,
                        partyName: true,
                        gstin: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const formattedCharges = sizingCharges.map((charge) => ({
            id: charge.id,
            partyId: charge.partyId,
            partyName: charge.party.partyName,
            chargePerKg: Number(charge.chargePerKg),
            chargePerBeam: charge.chargePerBeam ? Number(charge.chargePerBeam) : null,
            effectiveFrom: charge.effectiveFrom,
            effectiveTo: charge.effectiveTo,
            isActive: charge.isActive,
        }));

        return NextResponse.json(formattedCharges);
    } catch (error) {
        console.error('Error fetching sizing charges:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sizing charges' },
            { status: 500 }
        );
    }
}

// POST create new sizing charge
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { partyId, chargePerKg, chargePerBeam, effectiveFrom, effectiveTo } = data;

        if (!partyId || chargePerKg === undefined) {
            return NextResponse.json(
                { error: 'Party ID and Charge per KG are required' },
                { status: 400 }
            );
        }

        // Deactivate previous charges for this party
        await db.sizingCharge.updateMany({
            where: {
                partyId: parseInt(partyId),
                isActive: true,
            },
            data: {
                isActive: false,
                effectiveTo: new Date(),
            },
        });

        // Create new charge
        const sizingCharge = await db.sizingCharge.create({
            data: {
                partyId: parseInt(partyId),
                chargePerKg: parseFloat(chargePerKg),
                chargePerBeam: chargePerBeam ? parseFloat(chargePerBeam) : null,
                effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
                effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
                isActive: true,
            },
            include: {
                party: {
                    select: {
                        id: true,
                        partyName: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                id: sizingCharge.id,
                partyId: sizingCharge.partyId,
                partyName: sizingCharge.party.partyName,
                chargePerKg: Number(sizingCharge.chargePerKg),
                chargePerBeam: sizingCharge.chargePerBeam ? Number(sizingCharge.chargePerBeam) : null,
                effectiveFrom: sizingCharge.effectiveFrom,
                effectiveTo: sizingCharge.effectiveTo,
                isActive: sizingCharge.isActive,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating sizing charge:', error);
        return NextResponse.json(
            { error: 'Failed to create sizing charge' },
            { status: 500 }
        );
    }
}
