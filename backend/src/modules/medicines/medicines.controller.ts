import { z } from "zod";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/AppError.js";
import {
  createMedicine, deleteMedicine, dispensePrescription,
  createPrescription, getMedicine, getPrescription,
  listMedicines, listPrescriptions, updateMedicine,
} from "./medicines.service.js";
import {
  createMedicineBody, createPrescriptionBody,
  listMedicinesQuery, listPrescriptionsQuery,
  updateMedicineBody,
} from "./medicines.validator.js";

const idParam = z.object({ id: z.string() });

export function createMedicinesController() {
  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = listMedicinesQuery.parse(req.query);
    const result = await listMedicines(query.isActive, query.page, query.limit);
    res.json(result);
  });

  const getOne: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const medicine = await getMedicine(id);
    res.json({ medicine });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createMedicineBody.parse(req.body);
    const medicine = await createMedicine(body, req.auth.userId, req.ip);
    res.status(201).json({ medicine });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const body = updateMedicineBody.parse(req.body);
    const medicine = await updateMedicine(id, body, req.auth.userId, req.ip);
    res.json({ medicine });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    await deleteMedicine(id, req.auth.userId, req.ip);
    res.json({ message: "Medicine deleted" });
  });

  const listRx: RequestHandler = asyncHandler(async (req, res) => {
    const query = listPrescriptionsQuery.parse(req.query);
    const result = await listPrescriptions({ batchId: query.batchId, doctorId: query.doctorId, status: query.status }, query.page, query.limit);
    res.json(result);
  });

  const getOneRx: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const prescription = await getPrescription(id);
    res.json({ prescription });
  });

  const createRx: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createPrescriptionBody.parse(req.body);
    const prescription = await createPrescription(body, req.auth.userId, req.ip);
    res.status(201).json({ prescription });
  });

  const dispense: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const prescription = await dispensePrescription(id, req.auth.userId, req.ip);
    res.json({ prescription });
  });

  return { list, getOne, create, update, remove, listRx, getOneRx, createRx, dispense };
}
