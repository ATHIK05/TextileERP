import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch a single party
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const party = await db.party.findUnique({
            where: { id },
            include: {
                company: {
                    select: { id: true, name: true }
                }
            }
        });

        if (!party) {
            return NextResponse.json({ error: 'Party not found' }, { status: 404 });
        }

        return NextResponse.json(party);
    } catch (error) {
        console.error('Error fetching party:', error);
        return NextResponse.json(
            { error: 'Failed to fetch party' },
            { status: 500 }
        );
    }
}

// PUT: Update a party
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await request.json();
        const {
            companyId,
            partyName,
            gstin,
            pan,
            address,
            state,
            stateCode,
            phone,
            email,
            organizationType,
            bankName,
            bankAccount,
            ifsc,
            branch,
            noOfLooms,
            commissionPerBag,
            commissionPercent,
            dueDays,
            ledgerTypeId,
            accountGroupId,
            accountMaintenance,
            isActive
        } = data;

        // Validation
        if (!partyName || !companyId) {
            return NextResponse.json(
                { error: 'Party name and company are required' },
                { status: 400 }
            );
        }

        // Check if party exists
        const existingParty = await db.party.findUnique({
            where: { id }
        });

        if (!existingParty) {
            return NextResponse.json({ error: 'Party not found' }, { status: 404 });
        }

        // Check GSTIN conflict
        if (gstin) {
            const gstinConflict = await db.party.findFirst({
                where: {
                    gstin,
                    id: { not: id } // Exclude current party
                }
            });

            if (gstinConflict) {
                return NextResponse.json(
                    { error: 'Another party with this GSTIN already exists' },
                    { status: 400 }
                );
            }
        }

        const updatedParty = await db.party.update({
            where: { id },
            data: {
                companyId: parseInt(companyId),
                partyName,
                gstin,
                pan,
                address,
                state,
                stateCode,
                phone,
                email,
                organizationType,
                bankName,
                bankAccount,
                ifsc,
                branch,
                noOfLooms: noOfLooms ? parseInt(noOfLooms) : null,
                commissionPerBag: commissionPerBag ? parseFloat(commissionPerBag) : null,
                commissionPercent: commissionPercent ? parseFloat(commissionPercent) : null,
                dueDays: dueDays ? parseInt(dueDays) : 45,
                ledgerTypeId: ledgerTypeId ? parseInt(ledgerTypeId) : null,
                accountGroupId: accountGroupId ? parseInt(accountGroupId) : null,
                accountMaintenance,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return NextResponse.json(updatedParty);
    } catch (error) {
        console.error('Error updating party:', error);
        return NextResponse.json(
            { error: 'Failed to update party' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a party
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Check if party exists
        const existingParty = await db.party.findUnique({
            where: { id }
        });

        if (!existingParty) {
            return NextResponse.json({ error: 'Party not found' }, { status: 404 });
        }

        // 1. Check for TRANSACTION data
        const hasTransactions = await db.$transaction(async (tx) => {
            const jobCards = await tx.jobCard.count({ where: { partyId: id } });
            const invoices = await tx.taxInvoice.count({ where: { partyId: id } });
            const deliveredInvoices = await tx.taxInvoice.count({ where: { deliveredToPartyId: id } });
            const receipts = await tx.yarnReceipt.count({ where: { partyId: id } });
            const returns = await tx.yarnReturn.count({ where: { partyId: id } });
            const deliveries = await tx.yarnDelivery.count({ where: { partyId: id } });

            return jobCards + invoices + deliveredInvoices + receipts + returns + deliveries > 0;
        });

        if (hasTransactions) {
            return NextResponse.json(
                { error: 'Cannot delete party with existing transactions (Job Cards, Invoices, etc.). Please deactivate it instead.' },
                { status: 400 }
            );
        }

        // 2. Safe to Cascade Delete Dependent Data
        await db.$transaction(async (tx) => {
            // Delete sizing charges
            await tx.sizingCharge.deleteMany({ where: { partyId: id } });

            // Delete Party
            await tx.party.delete({ where: { id } });
        });

        return NextResponse.json({ message: 'Party and related dependent data deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting party:', error);

        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: 'Cannot delete this party because it has related records. Please check dependencies.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete party' },
            { status: 500 }
        );
    }
}
