import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  validateCreateActivity,
  validateUpdateActivity,
} from "../validators/activity.validator.js";

import {
  getActivities,
  getActivity,
  addActivity,
  editActivity,
  removeActivity,
  markActivityCompleted,
} from "../controllers/activity.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getActivities);

router.post("/", validate(validateCreateActivity), addActivity);

router.get("/:id", getActivity);

router.patch("/:id", validate(validateUpdateActivity), editActivity);

router.delete("/:id", removeActivity);

router.patch("/:id/complete", markActivityCompleted);

export default router;
