import { z } from "zod";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/AppError.js";
import {
  createCollectionReport,
  deleteCollectionReport,
  getCollectionReport,
  listCollectionReports,
  submitCollectionReport,
  updateCollectionReport,
} from "./collectionReports.service.js";
import {
  createCollectionReportBody,
  listCollectionReportsQuery,
  updateCollectionReportBody,
} from "./collectionReports.validator.js";

const idParam = z.object({ id: z.string() });

export function createCollectionReportsController() {
  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = listCollectionReportsQuery.parse(req.query);
    const result = await listCollectionReports(
      { farmId: query.farmId, vehicleId: query.vehicleId, status: query.status },
      query.page,
      query.limit
    );
    res.json(result);
  });

  const getOne: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const collectionReport = await getCollectionReport(id);
    res.json({ collectionReport });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createCollectionReportBody.parse(req.body);
    const collectionReport = await createCollectionReport(body, req.auth.userId, req.ip);
    res.status(201).json({ collectionReport });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const body = updateCollectionReportBody.parse(req.body);
    const collectionReport = await updateCollectionReport(id, body, req.auth.userId, req.ip);
    res.json({ collectionReport });
  });

  const submit: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const collectionReport = await submitCollectionReport(id, req.auth.userId, req.ip);
    res.json({ collectionReport });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    await deleteCollectionReport(id, req.auth.userId, req.ip);
    res.json({ message: "Collection report deleted" });
  });

  return { list, getOne, create, update, submit, remove };
}
