import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/AppError.js";
import { createFeedTransaction, getFeedStock, listFeedTransactions, setFeedStock, sumFeedUsedForBatch } from "./feed.service.js";
import { createTransactionBody, listTransactionsQuery, setFeedStockBody } from "./feed.validator.js";
import { z } from "zod";

export function createFeedController() {
  const getStock: RequestHandler = asyncHandler(async (_req, res) => {
    const stock = await getFeedStock();
    res.json({ stock });
  });

  const updateStock: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = setFeedStockBody.parse(req.body);
    const stock = await setFeedStock(body, req.auth.userId, req.ip);
    res.json({ stock });
  });

  const createTransaction: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createTransactionBody.parse(req.body);
    const transaction = await createFeedTransaction(body, req.auth.userId, req.ip);
    res.status(201).json({ transaction });
  });

  const listTransactions: RequestHandler = asyncHandler(async (req, res) => {
    const query = listTransactionsQuery.parse(req.query);
    const result = await listFeedTransactions({ batchId: query.batchId, feedStockId: query.feedStockId, type: query.type }, query.page, query.limit);
    res.json(result);
  });

  const getBatchTotal: RequestHandler = asyncHandler(async (req, res) => {
    const batchIdParam = z.object({ batchId: z.string() });
    const { batchId } = batchIdParam.parse(req.params);
    const totalFeedUsedKg = await sumFeedUsedForBatch(batchId);
    res.json({ batchId, totalFeedUsedKg });
  });

  return { getStock, updateStock, createTransaction, listTransactions, getBatchTotal };
}
