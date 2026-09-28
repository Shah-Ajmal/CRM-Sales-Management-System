import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  validateLead,
  validateLeadStatus,
  validateLeadAssignment,
} from "../validators/lead.validator.js";

import {
  getLeads,
  getLead,
  addLead,
  editLead,
  removeLead,
  changeLeadStatus,
  assignLeadToUser,
} from "../controllers/lead.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getLeads);

router.post("/", validate(validateLead), addLead);

router.get("/:id", getLead);

router.patch("/:id", validate(validateLead), editLead);

router.delete("/:id", removeLead);

router.patch("/:id/status", validate(validateLeadStatus), changeLeadStatus);

router.patch("/:id/assign", validate(validateLeadAssignment), assignLeadToUser);

export default router;
