import type { RequestHandler } from "express";
import type { Env } from "../../../core/env.js";
import { asyncHandler } from "../../../core/http/asyncHandler.js";
import {
  createSeller,
  deleteSeller,
  getSellerById,
  listSellers,
  updateSeller,
} from "./adminSellers.service.js";
import {
  createSellerBody,
  sellerIdParam,
  updateSellerBody,
} from "./adminSellers.validator.js";

export function createAdminSellersController(_env: Env) {
  const list: RequestHandler = asyncHandler(async (_req, res) => {
    const sellers = await listSellers();
    res.json({ sellers });
  });

  const getById: RequestHandler = asyncHandler(async (req, res) => {
    const { sellerId } = sellerIdParam.parse(req.params);
    const seller = await getSellerById(sellerId);
    res.json({ seller });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const body = createSellerBody.parse(req.body);
    const seller = await createSeller(body);
    res.status(201).json({ seller });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const { sellerId } = sellerIdParam.parse(req.params);
    const body = updateSellerBody.parse(req.body);
    const seller = await updateSeller(sellerId, body);
    res.json({ seller });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    const { sellerId } = sellerIdParam.parse(req.params);
    await deleteSeller(sellerId);
    res.status(204).send();
  });

  return { list, getById, create, update, remove };
}
