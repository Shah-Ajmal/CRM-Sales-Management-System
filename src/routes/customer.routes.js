import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { validateCustomer } from "../validators/customer.validator.js";

import {
  convertLead,
  getCustomers,
  getCustomer,
  addCustomer,
  editCustomer,
  removeCustomer,
} from "../controllers/customer.controller.js";

const router = Router();

router.use(authenticate);

router.post("/convert-lead/:id", convertLead);

router.get("/", getCustomers);

router.get("/:id", getCustomer);

router.post(
  "/",
  authorizeRoles("admin"),
  validate(validateCustomer),
  addCustomer,
);

router.patch("/:id", validate(validateCustomer), editCustomer);

router.delete("/:id", removeCustomer);

export default router;
