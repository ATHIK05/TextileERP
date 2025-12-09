import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET sizing details for a job card
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ setNo: string }> }
) {
    try {
        const { setNo } = await params;

        const jobCard = await db.jobCard.findUnique({
            where: { setNo },
            include: {
                sizingCard: {
                    include: {
                        beams: { orderBy: { sno: 'asc' } },
                        shiftDetails: true,
                        materials: true,
                    },
                },
            },
        });

        if (!jobCard) {
            return NextResponse.json({ error: 'Job Card not found' }, { status: 404 });
        }

        return NextResponse.json(jobCard.sizingCard || null);
    } catch (error) {
        console.error('Error fetching sizing card:', error);
        return NextResponse.json({ error: 'Failed to fetch sizing card' }, { status: 500 });
    }
}

// POST - Create or update sizing card
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ setNo: string }> }
) {
    try {
        const { setNo } = await params;
        const data = await request.json();

        const jobCard = await db.jobCard.findUnique({
            where: { setNo },
            include: { sizingCard: true },
        });

        if (!jobCard) {
            return NextResponse.json({ error: 'Job Card not found' }, { status: 404 });
        }

        // Update job card sizing date and status
        await db.jobCard.update({
            where: { setNo },
            data: {
                sizingDate: new Date(data.date),
                status: jobCard.status === 'WARPING' ? 'SIZING' :
                    jobCard.status === 'PENDING' ? 'SIZING' : jobCard.status,
            },
        });

        let sizingCard;
        if (jobCard.sizingCard) {
            // Update existing sizing card
            sizingCard = await db.sizingJobCard.update({
                where: { id: jobCard.sizingCard.id },
                data: {
                    date: new Date(data.date),
                    machineName: data.machineName,
                    setLength: data.setLength || 0,
                    markWheel: data.markWheel,
                    mark: data.mark,
                    tapeLength: data.tapeLength,
                    beamWidth: data.beamWidth || 0,
                    noOfBeams: data.noOfBeams || 0,
                    rf: data.rf,
                    viscosity: data.viscosity,
                    preCheck: data.preCheck,
                    pickUp: data.pickUp,
                    elongation: data.elongation,
                    elongationPercent: data.elongationPercent,
                    avgPickUpPercent: data.avgPickUpPercent,
                    frontWaste: data.frontWaste,
                    backWaste: data.backWaste,
                    remarks: data.remarks,
                    shiftSupervisor: data.shiftSupervisor,
                    checkedBy: data.checkedBy,
                    manager: data.manager,
                    sizerSign: data.sizerSign,
                    mdSign: data.mdSign,
                    fmSign: data.fmSign,
                },
            });

            // Delete existing beams and recreate
            await db.sizingBeam.deleteMany({ where: { sizingCardId: sizingCard.id } });
        } else {
            // Create new sizing card
            sizingCard = await db.sizingJobCard.create({
                data: {
                    jobCardId: jobCard.id,
                    date: new Date(data.date),
                    machineName: data.machineName,
                    setLength: data.setLength || 0,
                    markWheel: data.markWheel,
                    mark: data.mark,
                    tapeLength: data.tapeLength,
                    beamWidth: data.beamWidth || 0,
                    noOfBeams: data.noOfBeams || 0,
                    rf: data.rf,
                    viscosity: data.viscosity,
                    preCheck: data.preCheck,
                    pickUp: data.pickUp,
                    elongation: data.elongation,
                    elongationPercent: data.elongationPercent,
                    avgPickUpPercent: data.avgPickUpPercent,
                    frontWaste: data.frontWaste,
                    backWaste: data.backWaste,
                    remarks: data.remarks,
                    shiftSupervisor: data.shiftSupervisor,
                    checkedBy: data.checkedBy,
                    manager: data.manager,
                    sizerSign: data.sizerSign,
                    mdSign: data.mdSign,
                    fmSign: data.fmSign,
                },
            });
        }

        // Create beam entries
        if (data.beams && Array.isArray(data.beams)) {
            for (const beam of data.beams) {
                await db.sizingBeam.create({
                    data: {
                        sizingCardId: sizingCard.id,
                        frontRear: beam.frontRear,
                        sno: beam.sno,
                        beamNo: beam.beamNo,
                        clothMetres: beam.clothMetres || 0,
                        pcs: beam.pcs,
                        grossWeight: beam.grossWeight || 0,
                        tareWeight: beam.tareWeight || 0,
                        netWeight: beam.netWeight || 0,
                        readingMetres: beam.readingMetres,
                        startTime: beam.startTime ? new Date(beam.startTime) : null,
                        finishTime: beam.finishTime ? new Date(beam.finishTime) : null,
                        sizerName: beam.sizerName,
                        backSizer: beam.backSizer,
                        pickUps: beam.pickUps,
                        vendorName: beam.vendorName,
                        sizingComb: beam.sizingComb,
                        sizeBox: beam.sizeBox,
                        warpBeam: beam.warpBeam,
                        cylinder: beam.cylinder,
                    },
                });
            }
        }

        // Create shift detail entries
        if (data.shiftDetails && Array.isArray(data.shiftDetails)) {
            await db.sizingShift.deleteMany({ where: { sizingCardId: sizingCard.id } });
            for (const shift of data.shiftDetails) {
                await db.sizingShift.create({
                    data: {
                        sizingCardId: sizingCard.id,
                        shiftName: shift.shiftName,
                        pavu: shift.pavu,
                        mtr: shift.mtr,
                        kg: shift.kg,
                    },
                });
            }
        }

        // Create material entries
        if (data.materials && Array.isArray(data.materials)) {
            await db.sizingMaterial.deleteMany({ where: { sizingCardId: sizingCard.id } });
            for (const mat of data.materials) {
                await db.sizingMaterial.create({
                    data: {
                        sizingCardId: sizingCard.id,
                        materialName: mat.materialName,
                        weight: mat.weight || 0,
                    },
                });
            }
        }

        // Return updated sizing card
        const result = await db.sizingJobCard.findUnique({
            where: { id: sizingCard.id },
            include: {
                beams: { orderBy: { sno: 'asc' } },
                shiftDetails: true,
                materials: true,
            },
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error saving sizing card:', error);
        return NextResponse.json({ error: 'Failed to save sizing card' }, { status: 500 });
    }
}
