import { z } from "zod";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/AppError.js";
import { createFarmer, deleteFarmer, getFarmer, listFarmers, updateFarmer } from "./farmers.service.js";
import { createFarmerBody, listFarmersQuery, updateFarmerBody } from "./farmers.validator.js";

const idParam = z.object({ id: z.string() });

export function createFarmersController() {
  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = listFarmersQuery.parse(req.query);
    const result = await listFarmers(
      { name: query.name, areaId: query.areaId, isActive: query.isActive },
      query.page,
      query.limit
    );
    res.json(result);
  });

  const getOne: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const farmer = await getFarmer(id);
    res.json({ farmer });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createFarmerBody.parse(req.body);
    const farmer = await createFarmer(body, req.auth.userId, req.ip);
    res.status(201).json({ farmer });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const body = updateFarmerBody.parse(req.body);
    const farmer = await updateFarmer(id, body, req.auth.userId, req.ip);
    res.json({ farmer });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    await deleteFarmer(id, req.auth.userId, req.ip);
    res.json({ message: "Farmer deleted" });
  });

  return { list, getOne, create, update, remove };
}
