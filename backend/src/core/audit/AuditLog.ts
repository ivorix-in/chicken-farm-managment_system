import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../db.js";

export interface IAuditLog {
  id: string;
  _id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  changes?: Record<string, unknown> | null;
  ip?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, default: null, index: true },
    changes: { type: Schema.Types.Mixed, default: null },
    ip: { type: String, default: null },
  },
  { timestamps: true }
);

applyGlobalOptions(AuditLogSchema);

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);
