import type { RequestHandler } from "express";
import { asyncHandler } from "../../../core/http/asyncHandler.js";
import type { Env } from "../../../core/env.js";
import { createAdminUser } from "./adminUsers.service.js";
import { createAdminUserBody } from "./adminUsers.validator.js";

export function createAdminUsersController(_env: Env) {
  const create: RequestHandler = asyncHandler(async (req, res) => {
    const body = createAdminUserBody.parse(req.body);
    const admin = await createAdminUser(body);
    res.status(201).json({ admin });
  });

  return { create };
}
