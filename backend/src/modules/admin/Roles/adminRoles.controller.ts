import type { RequestHandler } from "express";
import type { Env } from "../../../core/env.js";
import { asyncHandler } from "../../../core/http/asyncHandler.js";
import { PERMISSIONS } from "../../../Constants/permissions.js";
import { flattenPermissionsCatalog } from "../../../Constants/flattenPermissionsCatalog.js";
import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
} from "./adminRoles.service.js";
import {
  createRoleBody,
  roleIdParam,
  updateRoleBody,
} from "./adminRoles.validator.js";

export function createAdminRolesController(_env: Env) {
  const permissionsCatalog: RequestHandler = asyncHandler(async (_req, res) => {
    const permissions = flattenPermissionsCatalog(PERMISSIONS);
    res.json({
      permissions,
      groups: [{ key: "admin", label: "Admin RBAC", items: [...permissions] }],
    });
  });

  const list: RequestHandler = asyncHandler(async (_req, res) => {
    const roles = await listRoles();
    res.json({ roles });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const body = createRoleBody.parse(req.body);
    const role = await createRole(body);
    res.status(201).json({ role });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const { roleId } = roleIdParam.parse(req.params);
    const body = updateRoleBody.parse(req.body);
    const role = await updateRole(roleId, body);
    res.json({ role });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    const { roleId } = roleIdParam.parse(req.params);
    await deleteRole(roleId);
    res.status(204).send();
  });

  return { permissionsCatalog, list, create, update, remove };
}
