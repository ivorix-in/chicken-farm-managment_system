import type { Request, Response, NextFunction } from "express";
import type { Env } from "../../../core/env.js";
import { Transaction } from "./models/Transaction.js";
import { createTransactionBody, listTransactionsQuery } from "./accounting.validator.js";
import { HttpError } from "../../../core/errors.js";

export function createAccountingController(env: Env) {
  return {
    async create(req: Request, res: Response, next: NextFunction) {
      try {
        const body = createTransactionBody.parse(req.body);
        const transaction = await Transaction.create({
          ...body,
          date: body.date ? new Date(body.date) : new Date(),
        });
        res.status(201).json({ data: transaction });
      } catch (error) {
        next(error);
      }
    },

    async list(req: Request, res: Response, next: NextFunction) {
      try {
        const query = listTransactionsQuery.parse(req.query);
        const filter: any = {};
        
        if (query.type) filter.type = query.type;
        if (query.category) filter.category = query.category;
        if (query.batchId) filter.batchId = query.batchId;
        if (query.farmId) filter.farmId = query.farmId;
        
        if (query.startDate || query.endDate) {
          filter.date = {};
          if (query.startDate) filter.date.$gte = new Date(query.startDate);
          if (query.endDate) filter.date.$lte = new Date(query.endDate);
        }

        const skip = (query.page - 1) * query.limit;
        const [items, total] = await Promise.all([
          Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(query.limit).lean(),
          Transaction.countDocuments(filter),
        ]);

        res.json({
          data: items,
          meta: {
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
          },
        });
      } catch (error) {
        next(error);
      }
    },

    async getSummary(req: Request, res: Response, next: NextFunction) {
      try {
        const query = listTransactionsQuery.parse(req.query);
        const filter: any = {};
        
        if (query.batchId) filter.batchId = query.batchId;
        if (query.farmId) filter.farmId = query.farmId;
        if (query.startDate || query.endDate) {
          filter.date = {};
          if (query.startDate) filter.date.$gte = new Date(query.startDate);
          if (query.endDate) filter.date.$lte = new Date(query.endDate);
        }

        const stats = await Transaction.aggregate([
          { $match: filter },
          {
            $group: {
              _id: "$type",
              totalAmount: { $sum: "$amount" },
            },
          },
        ]);

        const income = stats.find((s) => s._id === "INCOME")?.totalAmount || 0;
        const expenses = stats.find((s) => s._id === "EXPENSE")?.totalAmount || 0;
        const netProfit = income - expenses;

        res.json({
          data: {
            income,
            expenses,
            netProfit,
          },
        });
      } catch (error) {
        next(error);
      }
    },
  };
}
