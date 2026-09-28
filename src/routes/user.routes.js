import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  validateCreateUser,
  validateUpdateUser,
  validateUserStatus,
} from "../validators/user.validator.js";

import {
  getUsers,
  getUser,
  addUser,
  editUser,
  removeUser,
  activateUser,
  deactivateUser,
  changeUserStatus,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/", getUsers);
router.post("/", validate(validateCreateUser), addUser);

router.get("/:id", getUser);
router.patch("/:id", validate(validateUpdateUser), editUser);
router.delete("/:id", removeUser);

router.patch("/:id/activate", activateUser);
router.patch("/:id/deactivate", deactivateUser);
router.patch("/:id/status", validate(validateUserStatus), changeUserStatus);

export default router;
