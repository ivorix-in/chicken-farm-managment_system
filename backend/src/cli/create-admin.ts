/**
 * Interactive CLI: create an AdminUser (bcrypt password, SUPER_ADMIN role if needed).
 * Run: npm run admin:create
 */
import "dotenv/config";
import * as readline from "readline/promises";
import { PrismaClient } from "@prisma/client";
import { hashPassword, normalizeEmail } from "../modules/admin/Auth/adminAuth.helper.js";

const prisma = new PrismaClient();
const MIN_PASSWORD_LENGTH = 8;

const stdinStream = process.stdin;
const output = process.stdout;

function defaultNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "admin";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Admin";
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Masked password when stdin is a TTY; otherwise reads a line (visible). */
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
      if (s === "\n" || s === "\r" || s === "\u0004") {
        stdinStream.setRawMode(false);
        stdinStream.pause();
        stdinStream.removeListener("data", onData);
        output.write("\n");
        resolve(password);
        return;
      }
      if (s === "\u0003") {
        stdinStream.setRawMode(false);
        stdinStream.pause();
        reject(new Error("Interrupted"));
        return;
      }
      if (s === "\u007f" || s === "\b") {
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

async function ensureSuperAdminRole() {
  let role = await prisma.adminRole.findUnique({
    where: { code: "SUPER_ADMIN" },
  });
  if (!role) {
    role = await prisma.adminRole.create({
      data: {
        name: "Super Admin",
        code: "SUPER_ADMIN",
        permissions: ["*"],
      },
    });
    console.log("Created role:", role.code);
  }
  return role;
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
      console.error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      );
      process.exitCode = 1;
      return;
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });
    if (existing) {
      console.error("An admin with this email already exists.");
      process.exitCode = 1;
      return;
    }

    const role = await ensureSuperAdminRole();
    const passwordHash = await hashPassword(password);
    const name = defaultNameFromEmail(email);

    await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        roleId: role.id,
        name,
      },
    });

    console.log("Created admin:", email, `(${name}, role ${role.code})`);
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
