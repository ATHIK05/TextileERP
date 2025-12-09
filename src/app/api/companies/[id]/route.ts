import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch a single company
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const company = await db.company.findUnique({
            where: { id }
        });

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error('Error fetching company:', error);
        return NextResponse.json(
            { error: 'Failed to fetch company' },
            { status: 500 }
        );
    }
}

// PUT: Update a company
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await request.json();
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

        // Validation
        if (!name || !gstin) {
            return NextResponse.json(
                { error: 'Company name and GSTIN are required' },
                { status: 400 }
            );
        }

        // Check if company exists
        const existingCompany = await db.company.findUnique({
            where: { id }
        });

        if (!existingCompany) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        // Check if GSTIN conflict with OTHER companies
        const gstinConflict = await db.company.findFirst({
            where: {
                gstin,
                id: { not: id } // Exclude current company
            }
        });

        if (gstinConflict) {
            return NextResponse.json(
                { error: 'Another company with this GSTIN already exists' },
                { status: 400 }
            );
        }

        const updatedCompany = await db.company.update({
            where: { id },
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
            }
        });

        return NextResponse.json(updatedCompany);
    } catch (error) {
        console.error('Error updating company:', error);
        return NextResponse.json(
            { error: 'Failed to update company' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a company
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Check if company exists
        const existingCompany = await db.company.findUnique({
            where: { id }
        });

        if (!existingCompany) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        // 1. Check for TRANSACTION data (Job Cards, Invoices, Receipts, etc.)
        // If any transactions exist, we CANNOT delete the company.
        const hasTransactions = await db.$transaction(async (tx) => {
            const jobCards = await tx.jobCard.count({ where: { companyId: id } });
            const invoices = await tx.taxInvoice.count({ where: { companyId: id } });
            const receipts = await tx.yarnReceipt.count({ where: { companyId: id } });
            const returns = await tx.yarnReturn.count({ where: { companyId: id } });
            const deliveries = await tx.yarnDelivery.count({ where: { companyId: id } });

            return jobCards + invoices + receipts + returns + deliveries > 0;
        });

        if (hasTransactions) {
            return NextResponse.json(
                { error: 'Cannot delete company with existing transactions (Job Cards, Invoices, etc.). Please deactivate it instead.' },
                { status: 400 }
            );
        }

        // 2. Safe to Cascade Delete MASTER data (Parties, Vehicles, etc.)
        // We transactionally delete related master data then the company.
        await db.$transaction(async (tx) => {
            // Getting IDs of parties to clean their sub-data
            const companyParties = await tx.party.findMany({ where: { companyId: id }, select: { id: true } });
            const partyIds = companyParties.map(p => p.id);

            if (partyIds.length > 0) {
                // Delete SizingCharges for these parties
                await tx.sizingCharge.deleteMany({ where: { partyId: { in: partyIds } } });
                // Delete the Parties
                await tx.party.deleteMany({ where: { companyId: id } });
            }

            // Delete other masters
            await tx.deliveryPlace.deleteMany({ where: { companyId: id } });
            await tx.vehicle.deleteMany({ where: { companyId: id } });

            // Finally delete Company
            await tx.company.delete({ where: { id } });
        });

        return NextResponse.json({ message: 'Company and related master data deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting company:', error);

        // Fallback for other constraints
        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: 'Cannot delete company due to remaining related records. Please check dependencies.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete company' },
            { status: 500 }
        );
    }
}
