/**
 * Interactive CLI: create a Seller account.
 * Run: npm run seller:create
 */
import "dotenv/config";
import * as readline from "readline/promises";
import { PrismaClient, SellerType } from "@prisma/client";
import { hashPassword, normalizeEmail } from "../modules/seller/Auth/sellerAuth.helper.js";

const prisma = new PrismaClient();
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
      if (s === "\n" || s === "\r" || s === "") {
        stdinStream.setRawMode(false);
        stdinStream.pause();
        stdinStream.removeListener("data", onData);
        output.write("\n");
        resolve(password);
        return;
      }
      if (s === "") {
        stdinStream.setRawMode(false);
        stdinStream.pause();
        reject(new Error("Interrupted"));
        return;
      }
      if (s === "" || s === "\b") {
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
    const sellerType = sellerTypeRaw as SellerType;

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

    const existing = await prisma.seller.findUnique({ where: { email } });
    if (existing) {
      console.error("A seller with this email already exists.");
      process.exitCode = 1;
      return;
    }

    const existingPhone = await prisma.seller.findUnique({ where: { phoneNumber } });
    if (existingPhone) {
      console.error("A seller with this phone number already exists.");
      process.exitCode = 1;
      return;
    }

    const hashedPassword = await hashPassword(password);
    await prisma.seller.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        country,
        sellerType,
        isActive: true,
        ...(sellerType === "BUSINESS" ? { businessProfile: { create: {} } } : { individualProfile: { create: {} } }),
      },
    });

    console.log(`Created seller: ${email} (${firstName} ${lastName}, ${sellerType})`);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
