import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all job cards with warping and sizing info
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const setNo = searchParams.get('setNo');

        const where: any = {};
        if (status) where.status = status;
        if (setNo) where.setNo = { contains: setNo };

        const jobCards = await db.jobCard.findMany({
            where,
            include: {
                company: { select: { id: true, name: true } },
                party: { select: { id: true, partyName: true } },
                loomType: { select: { id: true, name: true } },
                warpingCard: true,
                sizingCard: true,
                beamDetails: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Flatten data for frontend
        const result = jobCards.map(jc => ({
            ...jc,
            companyName: jc.company?.name,
            partyName: jc.party?.partyName,
            loomTypeName: jc.loomType?.name,
            hasWarping: !!jc.warpingCard,
            hasSizing: !!jc.sizingCard,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching job cards:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job cards' },
            { status: 500 }
        );
    }
}

// POST - Create new job card
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.setNo || !data.companyId || !data.partyId) {
            return NextResponse.json(
                { error: 'Set No, Company, and Party are required' },
                { status: 400 }
            );
        }

        // Check if setNo already exists
        const existing = await db.jobCard.findUnique({
            where: { setNo: data.setNo },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Job Card with this Set No already exists' },
                { status: 400 }
            );
        }

        const jobCard = await db.jobCard.create({
            data: {
                setNo: data.setNo,
                date: data.date ? new Date(data.date) : new Date(),
                warpingDate: data.warpingDate ? new Date(data.warpingDate) : null,
                sizingDate: data.sizingDate ? new Date(data.sizingDate) : null,
                companyId: parseInt(data.companyId),
                partyId: parseInt(data.partyId),
                loomTypeId: data.loomTypeId ? parseInt(data.loomTypeId) : null,
                millName: data.millName || null,
                count: data.count || null,
                ends: data.ends ? parseInt(data.ends) : null,
                tapeLength: data.tapeLength || null,
                beamWidth: data.beamWidth || null,
                mark: data.mark || null,
                warpingMetres: data.warpingMetres ? parseFloat(data.warpingMetres) : null,
                status: 'PENDING',
            },
            include: {
                company: { select: { id: true, name: true } },
                party: { select: { id: true, partyName: true } },
                loomType: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json(jobCard, { status: 201 });
    } catch (error) {
        console.error('Error creating job card:', error);
        return NextResponse.json(
            { error: 'Failed to create job card' },
            { status: 500 }
        );
    }
}
