import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const accountGroups = await db.accountGroup.findMany({
      include: { parent: true },
      orderBy: { groupName: 'asc' }
    });
    return NextResponse.json(accountGroups);
  } catch (error) {
    console.error('Error fetching account groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { groupName, description, parentGroupId } = data;

    if (!groupName) {
      return NextResponse.json(
        { error: 'Account group name is required' },
        { status: 400 }
      );
    }

    // Check if account group with same name exists (optional but good practice)
    const existingGroup = await db.accountGroup.findFirst({
      where: { groupName }
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Account group with this name already exists' },
        { status: 400 }
      );
    }

    const newAccountGroup = await db.accountGroup.create({
      data: {
        groupName,
        description: description || '',
        parentGroupId: parentGroupId ? parseInt(parentGroupId) : null,
        isActive: true
      }
    });

    return NextResponse.json(newAccountGroup);
  } catch (error) {
    console.error('Error creating account group:', error);
    return NextResponse.json(
      { error: 'Failed to create account group' },
      { status: 500 }
    );
  }
}