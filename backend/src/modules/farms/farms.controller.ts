import { z } from "zod";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/AppError.js";
import { createFarm, deleteFarm, getFarm, listFarms, updateFarm } from "./farms.service.js";
import { createFarmBody, listFarmsQuery, updateFarmBody } from "./farms.validator.js";
import { listBatches } from "../batches/batches.service.js";

const idParam = z.object({ id: z.string() });

export function createFarmsController() {
  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = listFarmsQuery.parse(req.query);
    const result = await listFarms(
      { farmerId: query.farmerId, supervisorId: query.supervisorId, areaId: query.areaId, status: query.status, isActive: query.isActive },
      query.page,
      query.limit
    );
    res.json(result);
  });

  const getOne: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const farm = await getFarm(id);
    res.json({ farm });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createFarmBody.parse(req.body);
    const farm = await createFarm(body, req.auth.userId, req.ip);
    res.status(201).json({ farm });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const body = updateFarmBody.parse(req.body);
    const farm = await updateFarm(id, body, req.auth.userId, req.ip);
    res.json({ farm });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    await deleteFarm(id, req.auth.userId, req.ip);
    res.json({ message: "Farm deleted" });
  });

  const getBatches: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const result = await listBatches({ farmId: id }, 1, 100);
    res.json(result);
  });

  return { list, getOne, create, update, remove, getBatches };
}
