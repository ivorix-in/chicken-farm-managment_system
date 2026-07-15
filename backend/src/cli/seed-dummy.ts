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
import { Employee } from "../modules/employees/models/Employee.js";
import { Vehicle } from "../modules/vehicles/models/Vehicle.js";
import { CollectionReport } from "../modules/collectionReports/models/CollectionReport.js";
import { Medicine } from "../modules/medicines/models/Medicine.js";
import { Prescription } from "../modules/medicines/models/Prescription.js";
import { DailyVisit } from "../modules/dailyVisits/models/DailyVisit.js";

async function seedDummyData() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL env variable not defined.");
    process.exit(1);
  }
  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB for Kerala-specific seeding");

  const admin = await AdminUser.findOne();
  const adminId = admin ? admin.id : "system";

  // Clear existing dummy data for idempotency
  await Area.deleteMany({});
  await Farmer.deleteMany({});
  await Farm.deleteMany({});
  await Batch.deleteMany({});
  await Transaction.deleteMany({});
  await FeedStock.deleteMany({});
  await FeedTransaction.deleteMany({});
  await Employee.deleteMany({});
  await Vehicle.deleteMany({});
  await CollectionReport.deleteMany({});
  await Medicine.deleteMany({});
  await Prescription.deleteMany({});
  await DailyVisit.deleteMany({});

  console.log("Cleared existing collections...");

  // 1. Seed Kerala-specific Areas
  const area1 = await Area.create({ name: "Wayanad (Kalpetta Zone)", code: "KL-WYD", description: "High-altitude cooler farming district" });
  const area2 = await Area.create({ name: "Palakkad (Chittur Zone)", code: "KL-PKD", description: "Borders Tamil Nadu, dry plains zone" });
  const area3 = await Area.create({ name: "Kozhikode (Thamarassery Zone)", code: "KL-KKD", description: "Western foothills, high humidity zone" });

  console.log("Seeded Kerala Areas");

  // 2. Seed Kerala-specific Farmers
  const farmer1 = await Farmer.create({
    name: "Madhaven Nair",
    phone: "9845012345",
    address: "Nair Veedu, Kalpetta, Wayanad, Kerala",
  });
  const farmer2 = await Farmer.create({
    name: "Kurian Thomas",
    phone: "9447123456",
    address: "Thomas Villa, Chittur, Palakkad, Kerala",
  });
  const farmer3 = await Farmer.create({
    name: "Faisal Rahman",
    phone: "9946234567",
    address: "Rahman Manzil, Thamarassery, Kozhikode, Kerala",
  });

  console.log("Seeded Kerala Farmers");

  // 3. Seed Kerala-specific Farms (with professional KCF-XXXX identifiers prefixed in Name)
  const farm1 = await Farm.create({
    name: "KCF-0001: Kairali Broilers",
    farmerId: farmer1.id,
    areaId: area1.id,
    address: "Kalpetta East Road, Wayanad, Kerala",
    capacity: 8000,
    status: "ACTIVE",
  });
  const farm2 = await Farm.create({
    name: "KCF-0002: Malabar Poultry",
    farmerId: farmer2.id,
    areaId: area2.id,
    address: "Chittur bypass, Palakkad, Kerala",
    capacity: 12000,
    status: "ACTIVE",
  });
  await Farm.create({
    name: "KCF-0003: Periyar Farms",
    farmerId: farmer3.id,
    areaId: area3.id,
    address: "Foothills road, Thamarassery, Kozhikode, Kerala",
    capacity: 6000,
    status: "ACTIVE",
  });

  console.log("Seeded Kerala Farms");

  // 4. Seed Batches (using standard Kerala Placement Dates & Breeds)
  const batch1 = await Batch.create({
    batchNo: "B-WYD-2026-07-01",
    farmId: farm1.id,
    chickCount: 7500,
    currentBirdCount: 7410,
    placementDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago (ready for collection)
    status: "PROGRESS",
    createdBy: adminId,
    chickPurchase: {
      pricePerChick: 28,
      totalAmount: 210000,
      purchasedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      vendor: "Venky's Chicks Kerala",
      breed: "Cobb 500",
    }
  });

  const batch2 = await Batch.create({
    batchNo: "B-PKD-2026-07-02",
    farmId: farm2.id,
    chickCount: 11000,
    currentBirdCount: 11000,
    placementDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago (starter phase)
    status: "PROGRESS",
    createdBy: adminId,
    chickPurchase: {
      pricePerChick: 29,
      totalAmount: 319000,
      purchasedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      vendor: "Kerala Hatcheries Ltd",
      breed: "Ross 308",
    }
  });

  console.log("Seeded Batches");

  // Link active batches back to farms
  await Farm.findByIdAndUpdate(farm1.id, { currentBatchId: batch1.id });
  await Farm.findByIdAndUpdate(farm2.id, { currentBatchId: batch2.id });

  // 5. Seed Transactions (Accounting & P&L in Indian Rupees format)
  await Transaction.create([
    {
      type: "INCOME",
      category: "BIRD_SALES",
      amount: 1400490,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      description: "Sold 7410 birds (15,561 kg) from KCF-0001: Kairali Broilers (batch B-WYD-2026-07-01)",
      batchId: batch1.id,
      farmId: farm1.id,
    },
    {
      type: "INCOME",
      category: "MANURE_SALES",
      amount: 45000,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      description: "Sold manure collection to organic farm buyers in Palakkad",
      farmId: farm2.id,
    },
    {
      type: "EXPENSE",
      category: "CHICK_PURCHASE",
      amount: 210000,
      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      description: "Purchased 7500 chicks for KCF-0001: Kairali Broilers",
      batchId: batch1.id,
      farmId: farm1.id,
    },
    {
      type: "EXPENSE",
      category: "CHICK_PURCHASE",
      amount: 319000,
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      description: "Purchased 11000 chicks for KCF-0002: Malabar Poultry",
      batchId: batch2.id,
      farmId: farm2.id,
    },
    {
      type: "EXPENSE",
      category: "FEED_PURCHASE",
      amount: 262500,
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      description: "Procured 7500kg feed from KSE Limited, Wayanad",
      farmId: farm1.id,
    },
    {
      type: "EXPENSE",
      category: "TRANSPORT",
      amount: 15000,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      description: "Paid local logistics transport costs for Wayanad flock collection",
      batchId: batch1.id,
      farmId: farm1.id,
    },
    {
      type: "EXPENSE",
      category: "SALARY",
      amount: 35000,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      description: "Paid veterinary doctor salary for Kerala cluster monthly visits",
    }
  ]);

  console.log("Seeded Kerala Transactions");

  // 6. Seed Feed Stocks (using KSE Ltd & Godrej brands)
  const stockStarter = await FeedStock.create({
    feedType: "STARTER",
    quantityKg: 15000,
    unitCostPerKg: 38,
    lowStockThresholdKg: 3000,
  });
  const stockGrower = await FeedStock.create({
    feedType: "GROWER",
    quantityKg: 24000,
    unitCostPerKg: 35,
    lowStockThresholdKg: 4000,
  });
  await FeedStock.create({
    feedType: "FINISHER",
    quantityKg: 8000,
    unitCostPerKg: 32,
    lowStockThresholdKg: 2000,
  });
  const stockPreStarter = await FeedStock.create({
    feedType: "PRE_STARTER",
    quantityKg: 6000,
    unitCostPerKg: 42,
    lowStockThresholdKg: 1500,
  });

  console.log("Seeded Kerala Feed Stocks");

  // 7. Seed Feed Transactions
  await FeedTransaction.create([
    {
      batchId: batch1.id,
      feedStockId: stockStarter.id,
      quantityKg: 4000,
      numberOfBags: 80,
      type: "ISSUE",
      category: "GODOWN",
      issuedBy: adminId,
      issuedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      notes: "Starter feed issue for Wayanad batch",
    },
    {
      batchId: batch1.id,
      feedStockId: stockGrower.id,
      quantityKg: 3500,
      numberOfBags: 70,
      type: "ISSUE",
      category: "GODOWN",
      issuedBy: adminId,
      issuedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      notes: "Grower feed issue for Wayanad batch",
    },
    {
      batchId: batch2.id,
      feedStockId: stockPreStarter.id,
      quantityKg: 2000,
      numberOfBags: 40,
      type: "ISSUE",
      category: "GODOWN",
      issuedBy: adminId,
      issuedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      notes: "Pre-starter feed issue for Palakkad batch",
    },
  ]);

  console.log("Seeded Feed Transactions");

  // 8. Seed Kerala Employees
  await Employee.create([
    {
      name: "Anil Kumar",
      phone: "9446055112",
      email: "anil.kumar@farmvista.com",
      department: "SUPERVISOR",
      salary: 18000,
      joiningDate: new Date("2025-05-10"),
      isActive: true,
    },
    {
      name: "Suresh Gopinath",
      phone: "9847122044",
      email: "suresh.g@farmvista.com",
      department: "SUPERVISOR",
      salary: 19000,
      joiningDate: new Date("2025-08-01"),
      isActive: true,
    },
    {
      name: "Dr. Manoj Kumar",
      phone: "9447334455",
      email: "manoj.k@farmvista.com",
      department: "DOCTOR",
      salary: 35000,
      joiningDate: new Date("2024-12-15"),
      isActive: true,
    },
  ]);

  console.log("Seeded Kerala Employees");

  // 9. Seed Kerala Vehicles (KL format)
  const vehicle1 = await Vehicle.create({
    vehicleNo: "KL-12-E-4567",
    model: "Mahindra Bolero Pick-up",
    driverName: "Biju Kurup",
    isActive: true,
  });
  const vehicle2 = await Vehicle.create({
    vehicleNo: "KL-09-H-8910",
    model: "Tata 407 SFC",
    driverName: "Saji Varghese",
    isActive: true,
  });
  await Vehicle.create({
    vehicleNo: "KL-11-M-3344",
    model: "Ashok Leyland Dost",
    driverName: "Shaji Mathew",
    isActive: true,
  });

  console.log("Seeded Kerala Vehicles");

  // 10. Seed Collection Reports
  const items1 = [
    { boxNumber: 1, emptyWeight: 2.5, loadedWeight: 38.5, chickenWeight: 36.0, chickenCount: 18 },
    { boxNumber: 2, emptyWeight: 2.5, loadedWeight: 39.0, chickenWeight: 36.5, chickenCount: 19 },
    { boxNumber: 3, emptyWeight: 2.5, loadedWeight: 37.5, chickenWeight: 35.0, chickenCount: 17 },
  ];

  await CollectionReport.create({
    vehicleId: vehicle1.id,
    farmId: farm1.id,
    batchId: batch1.id,
    collectionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
    driverName: "Biju Kurup",
    remarks: "Wayanad collection, birds in optimal weight range",
    status: "DRAFT",
    totalBoxes: 3,
    totalChickens: 54,
    totalEmptyWeight: 7.5,
    totalLoadedWeight: 115.0,
    totalChickenWeight: 107.5,
    averageChickenWeight: 1.991,
    createdBy: adminId,
    items: items1,
  });

  const items2 = [
    { boxNumber: 1, emptyWeight: 2.5, loadedWeight: 37.0, chickenWeight: 34.5, chickenCount: 16 },
    { boxNumber: 2, emptyWeight: 2.5, loadedWeight: 36.5, chickenWeight: 34.0, chickenCount: 16 },
  ];

  await CollectionReport.create({
    vehicleId: vehicle2.id,
    farmId: farm2.id,
    batchId: batch2.id,
    collectionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
    driverName: "Saji Varghese",
    remarks: "Chittur harvest, initial sample collection",
    status: "SUBMITTED",
    totalBoxes: 2,
    totalChickens: 32,
    totalEmptyWeight: 5.0,
    totalLoadedWeight: 73.5,
    totalChickenWeight: 68.5,
    averageChickenWeight: 2.141,
    createdBy: adminId,
    items: items2,
  });

  console.log("Seeded Kerala Collection Reports");

  // 11. Seed Medicines
  const med1: any = await Medicine.create({
    name: "Vimeral",
    batchNo: "VIM-094",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    quantityUnits: 150,
    lowStockThreshold: 30,
    unit: "ML",
    unitCost: 180, // In Indian Rupees
    manufacturer: "Virbac India",
  });

  const med2: any = await Medicine.create({
    name: "Tylosin",
    batchNo: "TYL-882",
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
    quantityUnits: 80,
    lowStockThreshold: 15,
    unit: "VIAL",
    unitCost: 320, // In Indian Rupees
    manufacturer: "Elanco India",
  });

  const med3: any = await Medicine.create({
    name: "Neodox",
    batchNo: "NEO-541",
    expiryDate: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000), // 9 months from now
    quantityUnits: 250,
    lowStockThreshold: 50,
    unit: "SACHET",
    unitCost: 240, // In Indian Rupees
    manufacturer: "Venky's India",
  });

  console.log("Seeded Kerala Medicines");

  // 12. Seed Prescriptions
  await Prescription.create([
    {
      batchId: batch1.id,
      doctorId: adminId,
      medicines: [
        { medicineId: med1.id, dosage: "5ml per 100 birds", durationDays: 5 },
        { medicineId: med3.id, dosage: "1g per 2 liters", durationDays: 3 },
      ],
      instructions: "Administer in morning drinking water.",
      prescribedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: "DISPENSED",
      dispensedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      batchId: batch2.id,
      doctorId: adminId,
      medicines: [
        { medicineId: med2.id, dosage: "0.5ml per bird", durationDays: 2 },
      ],
      instructions: "Isolate affected flock and administer.",
      prescribedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "PENDING",
    }
  ]);

  console.log("Seeded Kerala Prescriptions");

  // 13. Seed Today's Daily Visit (to update dashboard KPIs)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await DailyVisit.create({
    batchId: batch1.id,
    supervisorId: adminId,
    visitDate: today,
    mortalityToday: 2,
    mortalityTotal: 12,
    cullsToday: 1,
    weakBirdsToday: 3,
    ownUseToday: 0,
    birdCount: 7407,
    approxWeightKg: 1.85,
    feedUsedKg: 450,
    feedBagsUsed: 9,
    remarks: "Birds are active. Normal water consumption.",
    notifyDoctor: false,
  });

  console.log("Seeded Today's Daily Visit");
  console.log("Kerala-specific dummy data seeding complete!");
}

seedDummyData()
  .then(() => mongoose.disconnect())
  .catch((e) => {
    console.error(e);
    void mongoose.disconnect();
    process.exit(1);
  });
