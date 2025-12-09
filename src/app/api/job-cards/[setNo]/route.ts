import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single job card by setNo
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ setNo: string }> }
) {
    try {
        const { setNo } = await params;

        const jobCard = await db.jobCard.findUnique({
            where: { setNo },
            include: {
                company: true,
                party: true,
                loomType: true,
                beamDetails: { orderBy: { id: 'asc' } },
                sizingDetails: { orderBy: { id: 'asc' } },
                deliveryDetails: { orderBy: { id: 'asc' } },
                babyConeDetails: { orderBy: { id: 'asc' } },
                warpingCard: {
                    include: {
                        beams: { orderBy: { sno: 'asc' } },
                        runOutCones: { orderBy: { sno: 'asc' } },
                        remnants: { orderBy: { sno: 'asc' } },
                    },
                },
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
            return NextResponse.json(
                { error: 'Job Card not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...jobCard,
            companyName: jobCard.company?.name,
            partyName: jobCard.party?.partyName,
            loomTypeName: jobCard.loomType?.name,
        });
    } catch (error) {
        console.error('Error fetching job card:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job card' },
            { status: 500 }
        );
    }
}

// PUT - Update job card
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ setNo: string }> }
) {
    try {
        const { setNo } = await params;
        const data = await request.json();

        const existing = await db.jobCard.findUnique({
            where: { setNo },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Job Card not found' },
                { status: 404 }
            );
        }

        const updatedJobCard = await db.jobCard.update({
            where: { setNo },
            data: {
                warpingDate: data.warpingDate ? new Date(data.warpingDate) : existing.warpingDate,
                sizingDate: data.sizingDate ? new Date(data.sizingDate) : existing.sizingDate,
                loomTypeId: data.loomTypeId ? parseInt(data.loomTypeId) : existing.loomTypeId,
                millName: data.millName ?? existing.millName,
                count: data.count ?? existing.count,
                ends: data.ends ? parseInt(data.ends) : existing.ends,
                tapeLength: data.tapeLength ?? existing.tapeLength,
                beamWidth: data.beamWidth ?? existing.beamWidth,
                mark: data.mark ?? existing.mark,
                warpingMetres: data.warpingMetres ? parseFloat(data.warpingMetres) : existing.warpingMetres,
                pickupPercentage: data.pickupPercentage ? parseFloat(data.pickupPercentage) : existing.pickupPercentage,
                elongationPercentage: data.elongationPercentage ? parseFloat(data.elongationPercentage) : existing.elongationPercentage,
                yarnTakenKg: data.yarnTakenKg ? parseFloat(data.yarnTakenKg) : existing.yarnTakenKg,
                remarks: data.remarks ?? existing.remarks,
                status: data.status ?? existing.status,
                preparedBy: data.preparedBy ?? existing.preparedBy,
                checkedBy: data.checkedBy ?? existing.checkedBy,
            },
            include: {
                company: true,
                party: true,
                loomType: true,
            },
        });

        return NextResponse.json(updatedJobCard);
    } catch (error) {
        console.error('Error updating job card:', error);
        return NextResponse.json(
            { error: 'Failed to update job card' },
            { status: 500 }
        );
    }
}

// DELETE - Delete job card
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ setNo: string }> }
) {
    try {
        const { setNo } = await params;

        const existing = await db.jobCard.findUnique({
            where: { setNo },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Job Card not found' },
                { status: 404 }
            );
        }

        await db.jobCard.delete({
            where: { setNo },
        });

        return NextResponse.json({ message: 'Job Card deleted successfully' });
    } catch (error) {
        console.error('Error deleting job card:', error);
        return NextResponse.json(
            { error: 'Failed to delete job card' },
            { status: 500 }
        );
    }
}
