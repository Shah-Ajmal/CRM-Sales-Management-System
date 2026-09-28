import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  validateCreateDeal,
  validateUpdateDeal,
  validateDealStage,
} from "../validators/deal.validator.js";

import {
  getDeals,
  getDeal,
  addDeal,
  editDeal,
  removeDeal,
  changeDealStage,
} from "../controllers/deal.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getDeals);

router.post("/", validate(validateCreateDeal), addDeal);

router.get("/:id", getDeal);

router.patch("/:id", validate(validateUpdateDeal), editDeal);

router.delete("/:id", removeDeal);

router.patch("/:id/stage", validate(validateDealStage), changeDealStage);

export default router;
