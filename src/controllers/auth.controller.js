import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/auth.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const createUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const user = await registerUser({
    name,
    email,
    password,
    phone,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "User registered successfully",
        createUserResponse(user),
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken } = await loginUser({
    email,
    password,
  });

  return res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user: createUserResponse(user),
      accessToken,
    }),
  );
});

const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Current user fetched successfully",
        createUserResponse(user),
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, "Logout successful"));
});

export { register, login, getMe, logout };
