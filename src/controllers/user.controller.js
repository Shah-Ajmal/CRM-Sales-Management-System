import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from "../services/user.service.js";

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getUsers = asyncHandler(async (req, res) => {
  const result = await listUsers(req.query);

  res.status(200).json(
    new ApiResponse(200, "Users fetched successfully", {
      users: result.users.map(userResponse),
      pagination: result.pagination,
    }),
  );
});

const getUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);

  res
    .status(200)
    .json(
      new ApiResponse(200, "User fetched successfully", userResponse(user)),
    );
});

const addUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const user = await createUser({
    name,
    email,
    password,
    phone,
    role: role || "sales_executive",
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, "User created successfully", userResponse(user)),
    );
});

const editUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, isActive } = req.body;

  const user = await updateUser(req.params.id, {
    name,
    email,
    password,
    phone,
    role,
    isActive,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "User updated successfully", userResponse(user)),
    );
});

const removeUser = asyncHandler(async (req, res) => {
  await deleteUser(req.params.id);

  res.status(200).json(new ApiResponse(200, "User deleted successfully"));
});

const activateUser = asyncHandler(async (req, res) => {
  const user = await updateUserStatus(req.params.id, true);

  res
    .status(200)
    .json(
      new ApiResponse(200, "User activated successfully", userResponse(user)),
    );
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await updateUserStatus(req.params.id, false);

  res
    .status(200)
    .json(
      new ApiResponse(200, "User deactivated successfully", userResponse(user)),
    );
});

const changeUserStatus = asyncHandler(async (req, res) => {
  const user = await updateUserStatus(req.params.id, req.body.isActive);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "User status updated successfully",
        createUserResponse(user),
      ),
    );
});

export {
  getUsers,
  getUser,
  addUser,
  editUser,
  removeUser,
  activateUser,
  deactivateUser,
  changeUserStatus,
};
