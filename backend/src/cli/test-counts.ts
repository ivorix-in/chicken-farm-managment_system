import "dotenv/config";
import mongoose from "mongoose";
import { Farmer } from "../modules/farmers/models/Farmer.js";
import { Area } from "../modules/areas/models/Area.js";
import { Employee } from "../modules/employees/models/Employee.js";
import { Farm } from "../modules/farms/models/Farm.js";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  await mongoose.connect(dbUrl);
  console.log("Farmers count:", await Farmer.countDocuments());
  console.log("Areas count:", await Area.countDocuments());
  console.log("Employees count:", await Employee.countDocuments());
  console.log("Farms count:", await Farm.countDocuments());
  await mongoose.disconnect();
}
main().catch(console.error);
