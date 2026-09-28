import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const listUsers = async (query) => {
  const {
    search = "",
    role,
    isActive,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (role) filter.role = role;

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const sort = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limitNumber),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const createUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  return User.create(data);
};

const updateUser = async (userId, data) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (data.email && data.email !== user.email) {
    const emailExists = await User.findOne({
      email: data.email,
      _id: { $ne: userId },
    });

    if (emailExists) {
      throw new ApiError(409, "Email already exists");
    }
  }

  Object.assign(user, data);

  await user.save();

  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const updateUserStatus = async (userId, isActive) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isActive = isActive;

  await user.save();

  return user;
};

export {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
};
