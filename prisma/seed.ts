import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Orange Sizing Unit company
  const orangeCompany = await prisma.company.upsert({
    where: { gstin: '33BFLPV9549C1ZZ' },
    update: {},
    create: {
      name: 'ORANGE SIZING UNIT',
      gstin: '33BFLPV9549C1ZZ',
      pan: 'BFLPV9549C',
      address: '545/1,ULAGAPURAM, , KUMARAVALASU, PERUNDURAI, , ERODE-638112',
      state: 'Tamil Nadu',
      stateCode: '33',
      phone: '9345945190,7094421351',
      email: 'orangesizingunit@gmail.com',
      bankName: 'KARUR VYSYA BANK',
      bankAccount: '1641223000000131',
      ifsc: 'KVBL0001641',
      branch: 'CHENNIMALAI',
    },
  });

  // Create Green Fine Textiles company
  const greenCompany = await prisma.company.upsert({
    where: { gstin: '33AAUFG4014A2ZU' },
    update: {},
    create: {
      name: 'GREEN FINE TEXTILES',
      gstin: '33AAUFG4014A2ZU',
      address: '247, THENMUGAM VELLODE, 200,KUMARAVALASU, ULAGAPURAM',
      state: 'Tamil Nadu',
      stateCode: '33',
      phone: '8973509999',
    },
  });

  // Create sample parties
  const sriShanmuga = await prisma.party.upsert({
    where: { gstin: '33AJDPP7980L1ZN' },
    update: {},
    create: {
      companyId: orangeCompany.id,
      partyName: 'M/S.SRI SHANMUGA TEXTILES',
      gstin: '33AJDPP7980L1ZN',
      pan: 'AJDPP7980L',
      address: '4/225, PETHAMUCHIPALAYAM, SAMALAPURAM, Tiruppur - 641663',
      state: 'Tamil Nadu',
      stateCode: '33',
      dueDays: 45,
      organizationType: 'Customer',
    },
  });

  const sriVipin = await prisma.party.upsert({
    where: { gstin: '33BQIPS4885G1ZD' },
    update: {},
    create: {
      companyId: orangeCompany.id,
      partyName: 'SRI VIPIN TEXTILE',
      gstin: '33BQIPS4885G1ZD',
      address: 'Door No.1/81, KARANAMPETTAI, PALLADAM Tiruppur - 641401',
      state: 'Tamil Nadu',
      stateCode: '33',
      dueDays: 30,
      organizationType: 'Customer',
    },
  });

  const pravinTextile = await prisma.party.upsert({
    where: { gstin: '33AKKPM0480A1ZN' },
    update: {},
    create: {
      companyId: greenCompany.id,
      partyName: 'PRAVIN TEXTILE',
      gstin: '33AKKPM0480A1ZN',
      address: '3/733,ARACHALUR ROAD, AMMAPALAYAM,CHENNIMALAI,ERODE-638051',
      state: 'Tamil Nadu',
      stateCode: '33',
      dueDays: 60,
      organizationType: 'Customer',
    },
  });

  const ashriyth = await prisma.party.upsert({
    where: { gstin: '33APQPN4127C1Z2' },
    update: {},
    create: {
      companyId: orangeCompany.id,
      partyName: 'M/s. ASHRIYTH AUTOLOOMS',
      gstin: '33APQPN4127C1Z2',
      address: 'SF NO.389/1A KOLLANKADDU THOTTAM, THATTAMPUDUR, KANIYUR POST, KARUMATHAMPATTI Coimbatore - 641659',
      state: 'Tamil Nadu',
      stateCode: '33',
      dueDays: 30,
      organizationType: 'Vendor',
    },
  });

  // Create ledger types
  const ledgerTypes = [
    'View/edit', 'Account', 'Agent', 'Bank account AC', 'Buyer', 'Customer',
    'Others', 'Cash account', 'Processing', 'Purchase ac', 'Sales account',
    'Sizing Vendor', 'Supplier', 'Supplier store', 'Tax', 'Transport',
    'Warehouse', 'Weaving vendor'
  ];

  for (const ledgerType of ledgerTypes) {
    await prisma.ledgerType.upsert({
      where: { name: ledgerType },
      update: {},
      create: {
        name: ledgerType,
        description: `${ledgerType} ledger type`,
      },
    });
  }

  // Create loom types
  const loomTypes = [
    { name: 'SULZER', chargePerBeam: 50, chargePerKg: 2.5 },
    { name: 'AIRJET', chargePerBeam: 45, chargePerKg: 2.0 },
    { name: 'RAPPER', chargePerBeam: 40, chargePerKg: 1.8 },
    { name: 'PROJECTILE', chargePerBeam: 55, chargePerKg: 2.8 },
  ];

  for (const loomType of loomTypes) {
    await prisma.loomType.upsert({
      where: { name: loomType.name },
      update: {},
      create: loomType,
    });
  }

  // Create vehicles
  const vehicles = [
    { vehicleNo: 'TN56R2935', vehicleType: 'Truck', driverName: 'Raju', driverPhone: '9876543210' },
    { vehicleNo: 'TN56R2913', vehicleType: 'Lorry', driverName: 'Kumar', driverPhone: '9876543211' },
    { vehicleNo: 'TN56AB1234', vehicleType: 'Van', driverName: 'Mani', driverPhone: '9876543212' },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { vehicleNo: vehicle.vehicleNo },
      update: {},
      create: {
        ...vehicle,
        companyId: orangeCompany.id,
      },
    });
  }

  // Create sizing charges for parties
  const existingSizingCharge = await prisma.sizingCharge.findFirst({
    where: {
      partyId: sriShanmuga.id,
      effectiveFrom: new Date('2024-01-01'),
    },
  });

  if (!existingSizingCharge) {
    await prisma.sizingCharge.create({
      data: {
        partyId: sriShanmuga.id,
        chargePerKg: 19.00,
        chargePerBeam: 500,
        effectiveFrom: new Date('2024-01-01'),
      },
    });
  }

  const existingSizingCharge2 = await prisma.sizingCharge.findFirst({
    where: {
      partyId: sriVipin.id,
      effectiveFrom: new Date('2024-01-01'),
    },
  });

  if (!existingSizingCharge2) {
    await prisma.sizingCharge.create({
      data: {
        partyId: sriVipin.id,
        chargePerKg: 18.50,
        chargePerBeam: 480,
        effectiveFrom: new Date('2024-01-01'),
      },
    });
  }

  // Create a sample invoice (only if it doesn't exist)
  const existingInvoice = await prisma.taxInvoice.findFirst({
    where: { invoiceNo: 'SZ0975/24-25' },
  });

  let sampleInvoice;
  if (!existingInvoice) {
    sampleInvoice = await prisma.taxInvoice.create({
      data: {
        invoiceNo: 'SZ0975/24-25',
        invoiceDate: new Date('2024-09-10'),
        companyId: orangeCompany.id,
        partyId: sriShanmuga.id,
        setNo: '394A',
        ends: 4080,
        count: "30's vortex",
        meters: 22070.00,
        taxableAmount: 31819.30,
        cgst: 795.48,
        sgst: 795.48,
        netAmount: 33410.00,
        paymentTerms: '45 Days ( 25/10/2024 )',
        items: {
          create: [{
            sNo: 1,
            description: '4080/30\'s vortex - SIZING CHARGES',
            hsnSac: '998821',
            quantity: 1674.700,
            rate: 19.00,
            amount: 31819.30,
          }],
        },
      },
    });
  } else {
    sampleInvoice = existingInvoice;
  }

  // Create some beams
  const beams = [
    { beamNo: '2078A', grossWeight: 502.5, tareWeight: 108.5, status: 'IN' },
    { beamNo: '2079A', grossWeight: 484.5, tareWeight: 89.5, status: 'IN' },
    { beamNo: '2080A', grossWeight: 481.5, tareWeight: 89.0, status: 'IN' },
    { beamNo: '2081A', grossWeight: 498.5, tareWeight: 102.0, status: 'IN' },
  ];

  for (const beam of beams) {
    await prisma.beam.upsert({
      where: { beamNo: beam.beamNo },
      update: {},
      create: {
        ...beam,
        yarnWeight: beam.grossWeight - beam.tareWeight,
      },
    });
  }

  // Create a sample job card (only if it doesn't exist)
  const existingJobCard = await prisma.jobCard.findFirst({
    where: { setNo: '399A' },
  });

  let sampleJobCard;
  if (!existingJobCard) {
    sampleJobCard = await prisma.jobCard.create({
      data: {
        setNo: '399A',
        date: new Date('2024-09-11'),
        companyId: orangeCompany.id,
        partyId: sriVipin.id,
        loomTypeId: 1, // SULZER
        millName: 'Kumaragiri',
        count: "30's vortex",
        ends: 4800,
        beamWidth: "74''",
        avgCount: 30.78,
        excess: 1.500,
        warpingMetres: 15800.00,
        pickupPercentage: 8.13,
        elongationPercentage: 4.81,
        yarnTakenKg: 1500.000,
        preparedBy: 'Admin',
        checkedBy: 'Manager',
      },
    });
  } else {
    sampleJobCard = existingJobCard;
  }

  // Add beam details to job card
  const beamDetails = [
    { beamNo: '2078A', grossWeight: 502.5, tareWeight: 108.5, breaks: 0, pieces: 0, meter: 4140.00 },
    { beamNo: '2079A', grossWeight: 484.5, tareWeight: 89.5, breaks: 0, pieces: 0, meter: 4140.00 },
    { beamNo: '2080A', grossWeight: 481.5, tareWeight: 89.0, breaks: 0, pieces: 0, meter: 4140.00 },
    { beamNo: '2081A', grossWeight: 498.5, tareWeight: 102.0, breaks: 0, pieces: 0, meter: 4140.00 },
  ];

  for (const beamDetail of beamDetails) {
    await prisma.jobCardBeam.create({
      data: {
        jobCardId: sampleJobCard.id,
        ...beamDetail,
        netWeight: beamDetail.grossWeight - beamDetail.tareWeight,
      },
    });
  }

  console.log('Database seeded successfully!');
  console.log('Sample Invoice ID:', sampleInvoice.id);
  console.log('Sample Job Card ID:', sampleJobCard.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });