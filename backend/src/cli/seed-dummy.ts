import "dotenv/config";
import mongoose from "mongoose";
import { Area } from "../modules/areas/models/Area.js";
import { Farmer } from "../modules/farmers/models/Farmer.js";
import { Farm } from "../modules/farms/models/Farm.js";
import { Batch } from "../modules/batches/models/Batch.js";
import { Transaction } from "../modules/accounting/models/Transaction.js";
import { AdminUser } from "../modules/admin/models/AdminUser.js";
import { FeedStock } from "../modules/feed/models/FeedStock.js";
import { FeedTransaction } from "../modules/feed/models/FeedTransaction.js";

async function seedDummyData() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL env variable not defined.");
    process.exit(1);
  }
  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB");

  const admin = await AdminUser.findOne();
  const adminId = admin ? admin.id : "system";

  // Clear existing dummy data (optional, but good for idempotency)
  await Area.deleteMany({});
  await Farmer.deleteMany({});
  await Farm.deleteMany({});
  await Batch.deleteMany({});
  await Transaction.deleteMany({});
  await FeedStock.deleteMany({});
  await FeedTransaction.deleteMany({});

  console.log("Cleared existing data...");

  // 1. Seed Areas
  const area1 = await Area.create({ name: "North Valley", code: "NV-01", description: "Northern farming zone" });
  const area2 = await Area.create({ name: "South Plains", code: "SP-02", description: "Southern plains zone" });

  console.log("Seeded Areas");

  // 2. Seed Farmers
  const farmer1 = await Farmer.create({
    name: "John Doe",
    phone: "555-0101",
    address: "123 North Valley Road",
    areaId: area1.id,
  });
  const farmer2 = await Farmer.create({
    name: "Jane Smith",
    phone: "555-0102",
    address: "456 South Plains Ave",
    areaId: area2.id,
  });

  console.log("Seeded Farmers");

  // 3. Seed Farms
  const farm1 = await Farm.create({
    name: "Valley Broilers",
    farmerId: farmer1.id,
    areaId: area1.id,
    address: "123 North Valley Road",
    capacity: 10000,
  });
  const farm2 = await Farm.create({
    name: "Plains Poultry",
    farmerId: farmer2.id,
    areaId: area2.id,
    address: "456 South Plains Ave",
    capacity: 15000,
  });

  console.log("Seeded Farms");

  // 4. Seed Batches
  const batch1 = await Batch.create({
    batchNo: "B-2026-07-01",
    farmId: farm1.id,
    chickCount: 5000,
    currentBirdCount: 5000,
    placementDate: new Date("2026-06-01"),
    status: "PROGRESS",
    createdBy: adminId,
  });
  const batch2 = await Batch.create({
    batchNo: "B-2026-07-02",
    farmId: farm2.id,
    chickCount: 8000,
    currentBirdCount: 8000,
    placementDate: new Date("2026-06-15"),
    status: "PROGRESS",
    createdBy: adminId,
  });

  console.log("Seeded Batches");

  // 5. Seed Transactions (Accounting & P&L)
  // Income
  await Transaction.create([
    {
      type: "INCOME",
      category: "BIRD_SALES",
      amount: 15000,
      date: new Date("2026-07-01"),
      description: "Sold 5000 mature birds from batch 1",
      batchId: batch1.id,
      farmId: farm1.id,
    },
    {
      type: "INCOME",
      category: "MANURE_SALES",
      amount: 800,
      date: new Date("2026-07-05"),
      description: "Sold manure to local fertilizer company",
      farmId: farm1.id,
    },
    {
      type: "INCOME",
      category: "BIRD_SALES",
      amount: 22000,
      date: new Date("2026-07-10"),
      description: "Sold 8000 mature birds from batch 2",
      batchId: batch2.id,
      farmId: farm2.id,
    },
    // Expenses
    {
      type: "EXPENSE",
      category: "CHICK_PURCHASE",
      amount: 2500,
      date: new Date("2026-06-01"),
      description: "Purchased 5000 day-old chicks for batch 1",
      batchId: batch1.id,
      farmId: farm1.id,
    },
    {
      type: "EXPENSE",
      category: "FEED_PURCHASE",
      amount: 5000,
      date: new Date("2026-06-05"),
      description: "Starter feed for batch 1",
      batchId: batch1.id,
      farmId: farm1.id,
    },
    {
      type: "EXPENSE",
      category: "CHICK_PURCHASE",
      amount: 4000,
      date: new Date("2026-06-15"),
      description: "Purchased 8000 day-old chicks for batch 2",
      batchId: batch2.id,
      farmId: farm2.id,
    },
    {
      type: "EXPENSE",
      category: "FEED_PURCHASE",
      amount: 8000,
      date: new Date("2026-06-20"),
      description: "Starter and Finisher feed for batch 2",
      batchId: batch2.id,
      farmId: farm2.id,
    },
    {
      type: "EXPENSE",
      category: "MEDICINE_PURCHASE",
      amount: 1200,
      date: new Date("2026-06-25"),
      description: "Vaccines and antibiotics for all farms",
    },
    {
      type: "EXPENSE",
      category: "SALARY",
      amount: 3000,
      date: new Date("2026-07-01"),
      description: "Monthly staff salaries (June)",
    },
    {
      type: "EXPENSE",
      category: "TRANSPORT",
      amount: 600,
      date: new Date("2026-07-02"),
      description: "Transport costs for feed delivery",
    },
  ]);

  console.log("Seeded Transactions (Accounting & P&L)");

  // 6. Seed Feed Stocks
  const stockStarter = await FeedStock.create({
    feedType: "STARTER",
    quantityKg: 8500,
    unitCostPerKg: 1.25,
    lowStockThresholdKg: 2000,
  });
  const stockGrower = await FeedStock.create({
    feedType: "GROWER",
    quantityKg: 12000,
    unitCostPerKg: 1.15,
    lowStockThresholdKg: 3000,
  });
  await FeedStock.create({
    feedType: "FINISHER",
    quantityKg: 1500,
    unitCostPerKg: 1.10,
    lowStockThresholdKg: 2000,
  });
  await FeedStock.create({
    feedType: "PRE_STARTER",
    quantityKg: 5000,
    unitCostPerKg: 1.35,
    lowStockThresholdKg: 1500,
  });

  console.log("Seeded Feed Stocks");

  // 7. Seed Feed Transactions
  await FeedTransaction.create([
    {
      batchId: batch1.id,
      feedStockId: stockStarter.id,
      quantityKg: 3000,
      numberOfBags: 60,
      type: "ISSUE",
      category: "GODOWN",
      issuedBy: adminId,
      issuedAt: new Date("2026-06-05"),
      notes: "Initial starter feed delivery",
    },
    {
      batchId: batch1.id,
      feedStockId: stockGrower.id,
      quantityKg: 2000,
      numberOfBags: 40,
      type: "ISSUE",
      category: "TMS_IN",
      issuedBy: adminId,
      issuedAt: new Date("2026-06-12"),
      notes: "Grower feed delivery via TMS",
    },
    {
      batchId: batch1.id,
      feedStockId: stockStarter.id,
      quantityKg: 200,
      numberOfBags: 4,
      type: "RETURN",
      category: "RETURN",
      issuedBy: adminId,
      issuedAt: new Date("2026-06-20"),
      notes: "Returned unused starter feed",
    },
    {
      batchId: batch1.id,
      feedStockId: stockGrower.id,
      quantityKg: 300,
      numberOfBags: 6,
      type: "ISSUE",
      category: "TRANSFER_OUT",
      issuedBy: adminId,
      issuedAt: new Date("2026-06-25"),
      notes: "Transferred grower feed to farm 2",
    },
    {
      batchId: batch2.id,
      feedStockId: stockStarter.id,
      quantityKg: 4500,
      numberOfBags: 90,
      type: "ISSUE",
      category: "GODOWN",
      issuedBy: adminId,
      issuedAt: new Date("2026-06-18"),
      notes: "Starter feed for batch 2",
    },
    {
      batchId: batch2.id,
      feedStockId: stockGrower.id,
      quantityKg: 3500,
      numberOfBags: 70,
      type: "ISSUE",
      category: "TMS_IN",
      issuedBy: adminId,
      issuedAt: new Date("2026-06-25"),
      notes: "Grower feed for batch 2",
    },
  ]);

  console.log("Seeded Feed Transactions");
  console.log("Dummy data seeding complete!");
}

seedDummyData()
  .then(() => mongoose.disconnect())
  .catch((e) => {
    console.error(e);
    void mongoose.disconnect();
    process.exit(1);
  });
