import { z } from "zod";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { AppError } from "../../core/errors/AppError.js";
import { createEmployee, deleteEmployee, getEmployee, listEmployees, updateEmployee } from "./employees.service.js";
import { createEmployeeBody, listEmployeesQuery, updateEmployeeBody } from "./employees.validator.js";

const idParam = z.object({ id: z.string() });

export function createEmployeesController() {
  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = listEmployeesQuery.parse(req.query);
    const result = await listEmployees(query.department, query.page, query.limit);
    res.json(result);
  });

  const getOne: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const employee = await getEmployee(id);
    res.json({ employee });
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const body = createEmployeeBody.parse(req.body);
    const employee = await createEmployee(body, req.auth.userId, req.ip);
    res.status(201).json({ employee });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    const body = updateEmployeeBody.parse(req.body);
    const employee = await updateEmployee(id, body, req.auth.userId, req.ip);
    res.json({ employee });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new AppError(401, "Unauthorized");
    const { id } = idParam.parse(req.params);
    await deleteEmployee(id, req.auth.userId, req.ip);
    res.json({ message: "Employee deleted" });
  });

  return { list, getOne, create, update, remove };
}
