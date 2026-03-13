import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CTOS database...\n");

  // ============================================================
  // 1. TERMINAL
  // ============================================================
  const terminal = await prisma.terminal.upsert({
    where: { code: "ALC-T1" },
    update: {},
    create: {
      name: "Al Chem Terminal 1",
      code: "ALC-T1",
      location: "Industrial Zone A, Port Area",
      description: "Primary chemical storage and distribution terminal",
    },
  });
  console.log("✅ Terminal created:", terminal.name);

  // ============================================================
  // 2. USERS (one per role)
  // ============================================================
  const hashedPw = await bcrypt.hash("ctos2026", 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@ctos.dev" },
      update: {},
      create: {
        email: "admin@ctos.dev",
        name: "Sarah Chen",
        password: hashedPw,
        role: "ADMIN",
        terminalId: terminal.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "terminal.mgr@ctos.dev" },
      update: {},
      create: {
        email: "terminal.mgr@ctos.dev",
        name: "James Morrison",
        password: hashedPw,
        role: "TERMINAL_MANAGER",
        terminalId: terminal.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "ops.mgr@ctos.dev" },
      update: {},
      create: {
        email: "ops.mgr@ctos.dev",
        name: "Maria Santos",
        password: hashedPw,
        role: "OPERATIONS_MANAGER",
        terminalId: terminal.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "planner@ctos.dev" },
      update: {},
      create: {
        email: "planner@ctos.dev",
        name: "David Kim",
        password: hashedPw,
        role: "PLANNER",
        terminalId: terminal.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "field.ops@ctos.dev" },
      update: {},
      create: {
        email: "field.ops@ctos.dev",
        name: "Alex Thompson",
        password: hashedPw,
        role: "FIELD_OPERATOR",
        terminalId: terminal.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "viewer@ctos.dev" },
      update: {},
      create: {
        email: "viewer@ctos.dev",
        name: "Rachel Green",
        password: hashedPw,
        role: "VIEWER",
        terminalId: terminal.id,
      },
    }),
  ]);
  console.log(`✅ ${users.length} users created`);

  // ============================================================
  // 3. PRODUCTS
  // ============================================================
  const products = await Promise.all([
    prisma.product.upsert({
      where: { code_terminalId: { code: "MEOH", terminalId: terminal.id } },
      update: {},
      create: { name: "Methanol", code: "MEOH", color: "#3B82F6", density: 791, flashPoint: 11, maxTemp: 35, minTemp: -5, vocRegulated: true, hazardClass: "3", terminalId: terminal.id },
    }),
    prisma.product.upsert({
      where: { code_terminalId: { code: "ETOH", terminalId: terminal.id } },
      update: {},
      create: { name: "Ethanol", code: "ETOH", color: "#10B981", density: 789, flashPoint: 13, maxTemp: 40, minTemp: -5, vocRegulated: true, hazardClass: "3", terminalId: terminal.id },
    }),
    prisma.product.upsert({
      where: { code_terminalId: { code: "BNZ", terminalId: terminal.id } },
      update: {},
      create: { name: "Benzene", code: "BNZ", color: "#F59E0B", density: 876, flashPoint: -11, maxTemp: 30, minTemp: 5, vocRegulated: true, hazardClass: "3", terminalId: terminal.id },
    }),
    prisma.product.upsert({
      where: { code_terminalId: { code: "XYL", terminalId: terminal.id } },
      update: {},
      create: { name: "Xylene", code: "XYL", color: "#8B5CF6", density: 864, flashPoint: 27, maxTemp: 35, minTemp: 0, vocRegulated: true, hazardClass: "3", terminalId: terminal.id },
    }),
    prisma.product.upsert({
      where: { code_terminalId: { code: "TOL", terminalId: terminal.id } },
      update: {},
      create: { name: "Toluene", code: "TOL", color: "#EF4444", density: 867, flashPoint: 4, maxTemp: 30, minTemp: -5, vocRegulated: true, hazardClass: "3", terminalId: terminal.id },
    }),
    prisma.product.upsert({
      where: { code_terminalId: { code: "AAC", terminalId: terminal.id } },
      update: {},
      create: { name: "Acetic Acid", code: "AAC", color: "#06B6D4", density: 1049, flashPoint: 39, maxTemp: 40, minTemp: 16, vocRegulated: false, hazardClass: "8", terminalId: terminal.id },
    }),
  ]);
  console.log(`✅ ${products.length} products created`);

  // ============================================================
  // 4. BERTHS
  // ============================================================
  const berths = await Promise.all([
    prisma.berth.upsert({
      where: { code_terminalId: { code: "B1", terminalId: terminal.id } },
      update: {},
      create: { name: "Berth 1 — Deep Water", code: "B1", maxDraft: 12, maxLOA: 200, positionX: 50, positionY: 300, terminalId: terminal.id },
    }),
    prisma.berth.upsert({
      where: { code_terminalId: { code: "B2", terminalId: terminal.id } },
      update: {},
      create: { name: "Berth 2 — Chemical Jetty", code: "B2", maxDraft: 10, maxLOA: 180, positionX: 50, positionY: 500, terminalId: terminal.id },
    }),
    prisma.berth.upsert({
      where: { code_terminalId: { code: "B3", terminalId: terminal.id } },
      update: {},
      create: { name: "Berth 3 — Barge Dock", code: "B3", maxDraft: 6, maxLOA: 100, positionX: 50, positionY: 700, terminalId: terminal.id },
    }),
  ]);
  console.log(`✅ ${berths.length} berths created`);

  // ============================================================
  // 5. TANKS (12 tanks)
  // ============================================================
  const tankConfigs = [
    { name: "Tank 101", code: "T101", capacity: 5000, currentLevel: 1200, posX: 600, posY: 150, products: ["MEOH", "ETOH"] },
    { name: "Tank 102", code: "T102", capacity: 5000, currentLevel: 3800, posX: 750, posY: 150, products: ["MEOH", "ETOH"] },
    { name: "Tank 103", code: "T103", capacity: 8000, currentLevel: 0, posX: 900, posY: 150, products: ["BNZ", "TOL", "XYL"] },
    { name: "Tank 104", code: "T104", capacity: 8000, currentLevel: 4500, posX: 1050, posY: 150, products: ["BNZ", "TOL", "XYL"] },
    { name: "Tank 201", code: "T201", capacity: 3000, currentLevel: 500, posX: 600, posY: 350, products: ["AAC"] },
    { name: "Tank 202", code: "T202", capacity: 3000, currentLevel: 2200, posX: 750, posY: 350, products: ["AAC"] },
    { name: "Tank 301", code: "T301", capacity: 10000, currentLevel: 6000, posX: 900, posY: 350, products: ["MEOH"] },
    { name: "Tank 302", code: "T302", capacity: 10000, currentLevel: 1000, posX: 1050, posY: 350, products: ["ETOH"] },
    { name: "Tank 401", code: "T401", capacity: 2000, currentLevel: 0, posX: 600, posY: 550, products: ["TOL"] },
    { name: "Tank 402", code: "T402", capacity: 2000, currentLevel: 800, posX: 750, posY: 550, products: ["XYL"] },
    { name: "Tank 501", code: "T501", capacity: 15000, currentLevel: 7500, posX: 900, posY: 550, products: ["MEOH", "ETOH"] },
    { name: "Tank 502", code: "T502", capacity: 15000, currentLevel: 0, posX: 1050, posY: 550, products: ["BNZ", "TOL"] },
  ];

  const productMap = Object.fromEntries(products.map((p) => [p.code, p.id]));

  for (const tc of tankConfigs) {
    const tank = await prisma.tank.upsert({
      where: { code_terminalId: { code: tc.code, terminalId: terminal.id } },
      update: {},
      create: {
        name: tc.name,
        code: tc.code,
        capacityM3: tc.capacity,
        currentLevelM3: tc.currentLevel,
        status: tc.currentLevel > 0 ? "IN_USE" : "AVAILABLE",
        hlaM3: tc.capacity * 0.9,
        hhlaM3: tc.capacity * 0.95,
        positionX: tc.posX,
        positionY: tc.posY,
        terminalId: terminal.id,
      },
    });

    // Assign compatible products
    for (const pCode of tc.products) {
      await prisma.tankProduct.upsert({
        where: { tankId_productId: { tankId: tank.id, productId: productMap[pCode] } },
        update: {},
        create: { tankId: tank.id, productId: productMap[pCode] },
      });
    }
  }
  console.log(`✅ ${tankConfigs.length} tanks created with product compatibility`);

  // ============================================================
  // 6. VALVES & PUMPS
  // ============================================================
  const valveCodes = ["V-B1-M", "V-B2-M", "V-B3-M", "V-P1-IN", "V-P1-OUT", "V-P2-IN", "V-P2-OUT", "V-T101", "V-T102", "V-T103", "V-T104", "V-T201", "V-T202", "V-T301", "V-T302"];
  for (let i = 0; i < valveCodes.length; i++) {
    await prisma.valve.upsert({
      where: { code_terminalId: { code: valveCodes[i], terminalId: terminal.id } },
      update: {},
      create: {
        name: `Valve ${valveCodes[i]}`,
        code: valveCodes[i],
        state: "CLOSED",
        positionX: 300 + (i % 5) * 100,
        positionY: 200 + Math.floor(i / 5) * 150,
        terminalId: terminal.id,
      },
    });
  }
  console.log(`✅ ${valveCodes.length} valves created`);

  const pumpCodes = ["P-001", "P-002", "P-003", "P-004"];
  for (let i = 0; i < pumpCodes.length; i++) {
    await prisma.pump.upsert({
      where: { code_terminalId: { code: pumpCodes[i], terminalId: terminal.id } },
      update: {},
      create: {
        name: `Pump ${pumpCodes[i]}`,
        code: pumpCodes[i],
        status: "STOPPED",
        maxFlowRate: 500,
        positionX: 400 + i * 150,
        positionY: 400,
        terminalId: terminal.id,
      },
    });
  }
  console.log(`✅ ${pumpCodes.length} pumps created`);

  // ============================================================
  // 7. SAMPLE VESSEL CALLS
  // ============================================================
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const vc1 = await prisma.vesselCall.create({
    data: {
      vesselName: "MT Chem Voyager",
      imoNumber: "9876543",
      eta: tomorrow,
      agent: "Global Ship Agency",
      status: "BERTHED",
      berthId: berths[0].id,
      terminalId: terminal.id,
      ata: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      notes: "Carrying methanol and benzene from Rotterdam",
    },
  });

  const vc2 = await prisma.vesselCall.create({
    data: {
      vesselName: "MT Pacific Spirit",
      imoNumber: "9123456",
      eta: nextWeek,
      agent: "Pacific Shipping Co",
      status: "SCHEDULED",
      berthId: berths[1].id,
      terminalId: terminal.id,
      notes: "Scheduled methanol discharge",
    },
  });
  console.log("✅ 2 vessel calls created");

  // Parcels for vessel call 1
  const parcel1 = await prisma.parcel.create({
    data: {
      vesselCallId: vc1.id,
      productId: productMap["MEOH"],
      nominatedVolume: 3000,
      owner: "ChemCorp International",
      qualitySpec: "ASTM D1152",
      status: "TRANSFERRING",
      allocatedTankId: null,
    },
  });

  const parcel2 = await prisma.parcel.create({
    data: {
      vesselCallId: vc1.id,
      productId: productMap["BNZ"],
      nominatedVolume: 2000,
      owner: "Petrostar Trading",
      qualitySpec: "ASTM D4734",
      status: "ALLOCATED",
      allocatedTankId: null,
    },
  });

  // Parcels for vessel call 2
  await prisma.parcel.create({
    data: {
      vesselCallId: vc2.id,
      productId: productMap["MEOH"],
      nominatedVolume: 5000,
      owner: "GreenEnergy Ltd",
      qualitySpec: "ASTM D1152",
      status: "NOMINATED",
    },
  });
  console.log("✅ 3 parcels created");

  // ============================================================
  // 8. SAMPLE TRANSFER
  // ============================================================
  const transfer1 = await prisma.transferRecord.create({
    data: {
      transferNumber: "TRF-2026-0001",
      parcelId: parcel1.id,
      type: "SHIP_TO_TANK",
      status: "IN_PROGRESS",
      sourceType: "vessel",
      sourceId: vc1.id,
      destType: "tank",
      destId: "T103",
      plannedVolume: 3000,
      flowRateM3h: 250,
      startTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      terminalId: terminal.id,
    },
  });

  // Events for the active transfer
  const eventTimes = [
    { offset: -4 * 60, type: "TRANSFER_CREATED" as const },
    { offset: -3.5 * 60, type: "ROUTE_CONFIRMED" as const },
    { offset: -3 * 60, type: "CHECKLIST_COMPLETED" as const },
    { offset: -2.5 * 60, type: "TRANSFER_STARTED" as const },
    { offset: -2 * 60, type: "FLOW_RATE_CHANGE" as const },
    { offset: -1 * 60, type: "ULLAGE_READING" as const },
    { offset: -0.5 * 60, type: "SHIP_FIGURE_RECORDED" as const },
  ];

  for (const evt of eventTimes) {
    await prisma.transferEvent.create({
      data: {
        transferId: transfer1.id,
        eventType: evt.type,
        timestamp: new Date(now.getTime() + evt.offset * 60 * 1000),
        userId: users[2].id, // Ops Manager
        notes: `${evt.type.replace(/_/g, " ").toLowerCase()}`,
      },
    });
  }

  // Completed transfer
  const transfer2 = await prisma.transferRecord.create({
    data: {
      transferNumber: "TRF-2026-0002",
      type: "TANK_TO_TRUCK",
      status: "COMPLETED",
      sourceType: "tank",
      sourceId: "T102",
      destType: "truck",
      destId: "TRUCK-BAY-1",
      plannedVolume: 30,
      actualVolume: 29.8,
      startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 46 * 60 * 60 * 1000),
      terminalId: terminal.id,
    },
  });
  console.log("✅ 2 transfers created (1 active, 1 completed)");

  console.log("\n🎉 Seed complete! CTOS is ready to go.\n");
  console.log("Login users:");
  for (const u of users) {
    console.log(`  ${u.role.padEnd(22)} — ${u.name} (${u.email})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
