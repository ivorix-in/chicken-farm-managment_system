import { z } from "zod";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/AppError.js";
import { createVisit, getVisit, listVisits } from "./dailyVisits.service.js";
import { createVisitBody, listVisitsQuery } from "./dailyVisits.validator.js";

const idParam = z.object({ id: z.string() });

export function createDailyVisitsController() {
  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = listVisitsQuery.parse(req.query);
    const result = await listVisits(
      {
        batchId: query.batchId,
        supervisorId: query.supervisorId,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      },
      query.page,
      query.limit
    );
    res.json(result);
  });

  const getOne: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const visit = await getVisit(id);
    res.json({ visit });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createVisitBody.parse(req.body);
    const visit = await createVisit(body, req.auth.userId, req.ip);
    res.status(201).json({ visit });
  });

  const getByBatch: RequestHandler = asyncHandler(async (req, res) => {
    const batchIdParam = z.object({ batchId: z.string() });
    const { batchId } = batchIdParam.parse(req.params);
    const result = await listVisits({ batchId }, 1, 1000);
    res.json(result);
  });

  return { list, getOne, create, getByBatch };
}
