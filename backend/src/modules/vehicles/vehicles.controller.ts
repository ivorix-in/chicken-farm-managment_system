import { z } from "zod";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/AppError.js";
import { createVehicle, deleteVehicle, getVehicle, listVehicles, updateVehicle } from "./vehicles.service.js";
import { createVehicleBody, updateVehicleBody } from "./vehicles.validator.js";

const idParam = z.object({ id: z.string() });

export function createVehiclesController() {
  const list: RequestHandler = asyncHandler(async (req, res) => {
    const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
    const result = await listVehicles(isActive);
    res.json(result);
  });

  const getOne: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const vehicle = await getVehicle(id);
    res.json({ vehicle });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createVehicleBody.parse(req.body);
    const vehicle = await createVehicle(body, req.auth.userId, req.ip);
    res.status(201).json({ vehicle });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const body = updateVehicleBody.parse(req.body);
    const vehicle = await updateVehicle(id, body, req.auth.userId, req.ip);
    res.json({ vehicle });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    await deleteVehicle(id, req.auth.userId, req.ip);
    res.json({ message: "Vehicle deleted" });
  });

  return { list, getOne, create, update, remove };
}
