import { z } from "zod";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/AppError.js";
import { createArea, deleteArea, getArea, listAreas, updateArea } from "./areas.service.js";
import { createAreaBody, listAreasQuery, updateAreaBody } from "./areas.validator.js";

const idParam = z.object({ id: z.string() });

export function createAreasController() {
  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = listAreasQuery.parse(req.query);
    const areas = await listAreas(query.isActive);
    res.json({ areas });
  });

  const getOne: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const area = await getArea(id);
    res.json({ area });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createAreaBody.parse(req.body);
    const area = await createArea(body, req.auth.userId, req.ip);
    res.status(201).json({ area });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const body = updateAreaBody.parse(req.body);
    const area = await updateArea(id, body, req.auth.userId, req.ip);
    res.json({ area });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    await deleteArea(id, req.auth.userId, req.ip);
    res.json({ message: "Area deleted" });
  });

  return { list, getOne, create, update, remove };
}
