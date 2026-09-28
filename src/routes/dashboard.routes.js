import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import { getDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorizeRoles("admin"), getDashboard);

export default router;
