import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET warping details for a job card
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ setNo: string }> }
) {
    try {
        const { setNo } = await params;

        const jobCard = await db.jobCard.findUnique({
            where: { setNo },
            include: {
                warpingCard: {
                    include: {
                        beams: { orderBy: { sno: 'asc' } },
                        runOutCones: { orderBy: { sno: 'asc' } },
                        remnants: { orderBy: { sno: 'asc' } },
                    },
                },
            },
        });

        if (!jobCard) {
            return NextResponse.json({ error: 'Job Card not found' }, { status: 404 });
        }

        return NextResponse.json(jobCard.warpingCard || null);
    } catch (error) {
        console.error('Error fetching warping card:', error);
        return NextResponse.json({ error: 'Failed to fetch warping card' }, { status: 500 });
    }
}

// POST - Create or update warping card
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ setNo: string }> }
) {
    try {
        const { setNo } = await params;
        const data = await request.json();

        const jobCard = await db.jobCard.findUnique({
            where: { setNo },
            include: { warpingCard: true },
        });

        if (!jobCard) {
            return NextResponse.json({ error: 'Job Card not found' }, { status: 404 });
        }

        // Update job card warping date
        await db.jobCard.update({
            where: { setNo },
            data: {
                warpingDate: new Date(data.date),
                status: jobCard.status === 'PENDING' ? 'WARPING' : jobCard.status,
            },
        });

        let warpingCard;
        if (jobCard.warpingCard) {
            // Update existing warping card
            warpingCard = await db.warpingJobCard.update({
                where: { id: jobCard.warpingCard.id },
                data: {
                    date: new Date(data.date),
                    lengthInMtrs: data.lengthInMtrs,
                    machineNo: data.machineNo,
                    lotNo: data.lotNo,
                    coneWeight: data.coneWeight,
                    preCheck: data.preCheck,
                    totalWarpBreaks: data.totalWarpBreaks,
                    breaksPerMillion: data.breaksPerMillion,
                    fullBagsTaken: data.fullBagsTaken,
                    runOutConeTaken: data.runOutConeTaken,
                    totalYarnNWT: data.totalYarnNWT,
                    warpNWT: data.warpNWT,
                    cutConeNWT: data.cutConeNWT,
                    excessShortage: data.excessShortage,
                    remarks: data.remarks,
                },
            });

            // Delete existing beams and recreate
            await db.warpingBeam.deleteMany({ where: { warpingCardId: warpingCard.id } });
        } else {
            // Create new warping card
            warpingCard = await db.warpingJobCard.create({
                data: {
                    jobCardId: jobCard.id,
                    date: new Date(data.date),
                    lengthInMtrs: data.lengthInMtrs || 0,
                    machineNo: data.machineNo,
                    lotNo: data.lotNo,
                    coneWeight: data.coneWeight,
                    preCheck: data.preCheck,
                    totalWarpBreaks: data.totalWarpBreaks,
                    breaksPerMillion: data.breaksPerMillion,
                    fullBagsTaken: data.fullBagsTaken,
                    runOutConeTaken: data.runOutConeTaken,
                    totalYarnNWT: data.totalYarnNWT,
                    warpNWT: data.warpNWT,
                    cutConeNWT: data.cutConeNWT,
                    excessShortage: data.excessShortage,
                    remarks: data.remarks,
                },
            });
        }

        // Create beam entries
        if (data.beams && Array.isArray(data.beams)) {
            for (const beam of data.beams) {
                await db.warpingBeam.create({
                    data: {
                        warpingCardId: warpingCard.id,
                        sno: beam.sno,
                        beamNo: beam.beamNo,
                        metre: beam.metre || 0,
                        ends: beam.ends || 0,
                        grossWeight: beam.grossWeight || 0,
                        tareWeight: beam.tareWeight || 0,
                        netWeight: beam.netWeight || 0,
                        startTime: beam.startTime ? new Date(beam.startTime) : null,
                        finishTime: beam.finishTime ? new Date(beam.finishTime) : null,
                        rpm: beam.rpm,
                        warperName: beam.warperName,
                        breaks: beam.breaks,
                        beamCount: beam.beamCount,
                    },
                });
            }
        }

        // Create run out cone entries
        if (data.runOutCones && Array.isArray(data.runOutCones)) {
            await db.warpingRunOutCone.deleteMany({ where: { warpingCardId: warpingCard.id } });
            for (const cone of data.runOutCones) {
                await db.warpingRunOutCone.create({
                    data: {
                        warpingCardId: warpingCard.id,
                        sno: cone.sno,
                        creelingCones: cone.creelingCones,
                        runOutWeight: cone.runOutWeight,
                        coneCount: cone.coneCount,
                        netWeight: cone.netWeight,
                    },
                });
            }
        }

        // Create remnant entries
        if (data.remnants && Array.isArray(data.remnants)) {
            await db.warpingRemnant.deleteMany({ where: { warpingCardId: warpingCard.id } });
            for (const rem of data.remnants) {
                await db.warpingRemnant.create({
                    data: {
                        warpingCardId: warpingCard.id,
                        sno: rem.sno,
                        noOfCones: rem.noOfCones || 0,
                        grossWeight: rem.grossWeight || 0,
                        netWeight: rem.netWeight || 0,
                    },
                });
            }
        }

        // Return updated warping card
        const result = await db.warpingJobCard.findUnique({
            where: { id: warpingCard.id },
            include: {
                beams: { orderBy: { sno: 'asc' } },
                runOutCones: { orderBy: { sno: 'asc' } },
                remnants: { orderBy: { sno: 'asc' } },
            },
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error saving warping card:', error);
        return NextResponse.json({ error: 'Failed to save warping card' }, { status: 500 });
    }
}
