import mongoose, { Schema } from "mongoose";

export async function connectDb(url: string): Promise<void> {
  try {
    await mongoose.connect(url);
    console.log("Database connected successfully to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

export async function disconnectDb(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("Database disconnected successfully");
  } catch (error) {
    console.error("Database disconnection error:", error);
    throw error;
  }
}

export function applyGlobalOptions(schema: Schema): void {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      return ret;
    },
  });

  schema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      return ret;
    },
  });
}
