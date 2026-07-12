/**
 * Interactive CLI: create a Seller account.
 * Run: npm run seller:create
 */
import "dotenv/config";
import * as readline from "readline/promises";
import mongoose from "mongoose";
import { Seller } from "../modules/seller/models/index.js";
import { hashPassword, normalizeEmail } from "../modules/seller/Auth/sellerAuth.helper.js";

const MIN_PASSWORD_LENGTH = 8;

const stdinStream = process.stdin;
const output = process.stdout;

async function questionPassword(
  rl: Awaited<ReturnType<typeof readline.createInterface>>
): Promise<string> {
  if (!stdinStream.isTTY) {
    return rl.question("Password: ");
  }
  return new Promise((resolve, reject) => {
    output.write("Password: ");
    stdinStream.setRawMode(true);
    stdinStream.resume();
    stdinStream.setEncoding("utf8");
    let password = "";
    const onData = (key: string | Buffer) => {
      const s = typeof key === "string" ? key : key.toString("utf8");
      if (s === "\n" || s === "\r" || s === " ") {
        stdinStream.setRawMode(false);
        stdinStream.pause();
        stdinStream.removeListener("data", onData);
        output.write("\n");
        resolve(password);
        return;
      }
      if (s === " ") {
        stdinStream.setRawMode(false);
        stdinStream.pause();
        reject(new Error("Interrupted"));
        return;
      }
      if (s === " " || s === "\b") {
        if (password.length > 0) {
          password = password.slice(0, -1);
          output.write("\b \b");
        }
        return;
      }
      password += s;
      output.write("*");
    };
    stdinStream.on("data", onData);
  });
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL env variable not defined.");
    process.exit(1);
  }
  await mongoose.connect(dbUrl);

  const rl = readline.createInterface({ input: stdinStream, output });

  try {
    const emailRaw = await rl.question("Email: ");
    const email = normalizeEmail(emailRaw);
    if (!email || !email.includes("@")) {
      console.error("Invalid email.");
      process.exitCode = 1;
      return;
    }

    const firstName = (await rl.question("First name: ")).trim();
    const lastName = (await rl.question("Last name: ")).trim();
    const phoneNumber = (await rl.question("Phone number: ")).trim();
    const country = (await rl.question("Country: ")).trim();

    const sellerTypeRaw = (await rl.question("Seller type (BUSINESS / INDIVIDUAL): ")).trim().toUpperCase();
    if (sellerTypeRaw !== "BUSINESS" && sellerTypeRaw !== "INDIVIDUAL") {
      console.error("Invalid seller type. Must be BUSINESS or INDIVIDUAL.");
      process.exitCode = 1;
      return;
    }
    const sellerType = sellerTypeRaw as "BUSINESS" | "INDIVIDUAL";

    let password: string;
    try {
      password = await questionPassword(rl);
    } catch (e) {
      if (e instanceof Error && e.message === "Interrupted") {
        output.write("\n");
        process.exit(130);
      }
      throw e;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      process.exitCode = 1;
      return;
    }

    const existing = await Seller.findOne({ email });
    if (existing) {
      console.error("A seller with this email already exists.");
      process.exitCode = 1;
      return;
    }

    const existingPhone = await Seller.findOne({ phoneNumber });
    if (existingPhone) {
      console.error("A seller with this phone number already exists.");
      process.exitCode = 1;
      return;
    }

    const hashedPassword = await hashPassword(password);
    await Seller.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      country,
      sellerType,
      isActive: true,
      individualProfile: sellerType === "INDIVIDUAL" ? {} : null,
      businessProfile: sellerType === "BUSINESS" ? {} : null,
    });

    console.log(`Created seller: ${email} (${firstName} ${lastName}, ${sellerType})`);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  void mongoose.disconnect();
  process.exit(1);
});
