import { z } from "zod";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/AppError.js";
import { closeBatch, createBatch, getBatch, getBatchSummary, listBatches, updateBatch } from "./batches.service.js";
import { createBatchBody, listBatchesQuery, updateBatchBody } from "./batches.validator.js";

const idParam = z.object({ id: z.string() });

export function createBatchesController() {
  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = listBatchesQuery.parse(req.query);
    const result = await listBatches({ farmId: query.farmId, status: query.status, createdBy: query.createdBy }, query.page, query.limit);
    res.json(result);
  });

  const getOne: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const batch = await getBatch(id);
    res.json({ batch });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createBatchBody.parse(req.body);
    const batch = await createBatch(body, req.auth.userId, req.ip);
    res.status(201).json({ batch });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const body = updateBatchBody.parse(req.body);
    const batch = await updateBatch(id, body, req.auth.userId, req.ip);
    res.json({ batch });
  });

  const close: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const result = await closeBatch(id, req.auth.userId, req.ip);
    res.json(result);
  });

  const summary: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const result = await getBatchSummary(id);
    res.json({ summary: result });
  });

  return { list, getOne, create, update, close, summary };
}
