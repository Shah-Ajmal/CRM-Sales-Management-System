import { Router } from "express";
import validate from "../middleware/validate.middleware.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/auth.validator.js";

import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/auth.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validate(validateRegister), register);

router.post("/login", validate(validateLogin), login);

router.get("/me", authenticate, getMe);

router.post("/logout", authenticate, logout);

export default router;
