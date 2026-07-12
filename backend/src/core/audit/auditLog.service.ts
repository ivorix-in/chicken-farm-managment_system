import { AuditLog } from "./AuditLog.js";

export interface AuditLogInput {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  ip?: string;
}

/** Fire-and-forget audit log. Never throws — errors are swallowed silently. */
export function logAction(input: AuditLogInput): void {
  AuditLog.create({
    userId: input.userId,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    changes: input.changes ?? null,
    ip: input.ip ?? null,
  }).catch((err) => {
    console.error("[AuditLog] Failed to write audit log:", err);
  });
}
