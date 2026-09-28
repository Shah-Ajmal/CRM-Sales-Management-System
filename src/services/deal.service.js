import Deal from "../models/Deal.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const CLOSED_STAGES = ["won", "lost"];

const validateAssignedUser = async (assignedTo) => {
  const user = await User.findById(assignedTo);

  if (!user) {
    throw new ApiError(404, "Assigned user not found");
  }

  if (user.role !== "sales_executive") {
    throw new ApiError(400, "Deal must be assigned to a sales executive");
  }

  if (!user.isActive) {
    throw new ApiError(400, "Deal cannot be assigned to an inactive user");
  }

  return user;
};

const validateCustomer = async (customerId) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return customer;
};

const checkDealAccess = (deal, userId, role) => {
  if (role === "admin") {
    return;
  }

  if (
    !deal.assignedTo ||
    deal.assignedTo._id.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "You do not have permission to access this deal");
  }
};

const checkClosedDeal = (deal) => {
  if (CLOSED_STAGES.includes(deal.stage)) {
    throw new ApiError(400, "Closed deals cannot be modified");
  }
};

const listDeals = async (userId, role, query) => {
  const {
    search = "",
    stage,
    customer,
    assignedTo,
    minAmount,
    maxAmount,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter = {};

  // Sales executives can only see their own deals.
  if (role === "sales_executive") {
    filter.assignedTo = userId;
  }

  // Admin can filter by assigned user.
  if (role === "admin" && assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (stage) {
    filter.stage = stage;
  }

  if (customer) {
    filter.customer = customer;
  }

  if (search) {
    filter.title = {
      $regex: search,
      $options: "i",
    };
  }

  if (minAmount !== undefined || maxAmount !== undefined) {
    filter.amount = {};

    if (minAmount !== undefined) {
      filter.amount.$gte = Number(minAmount);
    }

    if (maxAmount !== undefined) {
      filter.amount.$lte = Number(maxAmount);
    }
  }

  const allowedSortFields = [
    "title",
    "amount",
    "stage",
    "expectedClosingDate",
    "createdAt",
    "updatedAt",
  ];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const sort = {
    [safeSortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const pageNumber = Math.max(Number(page), 1);

  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const [deals, total] = await Promise.all([
    Deal.find(filter)
      .populate("customer", "name email phone company status")
      .populate("assignedTo", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),

    Deal.countDocuments(filter),
  ]);

  return {
    deals,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getDealById = async (dealId, userId, role) => {
  const deal = await Deal.findById(dealId)
    .populate("customer", "name email phone company status")
    .populate("assignedTo", "name email role");

  if (!deal) {
    throw new ApiError(404, "Deal not found");
  }

  checkDealAccess(deal, userId, role);

  return deal;
};

const createDeal = async (data, userId, role) => {
  const customer = await validateCustomer(data.customer);

  const assignedUser = await validateAssignedUser(data.assignedTo);

  // Sales executives cannot create deals
  // for another sales executive's customer.
  if (role === "sales_executive") {
    if (
      !customer.assignedTo ||
      customer.assignedTo.toString() !== userId.toString()
    ) {
      throw new ApiError(
        403,
        "You can only create deals for customers assigned to you",
      );
    }

    if (assignedUser._id.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only assign deals to yourself");
    }
  }

  return Deal.create(data);
};

const updateDeal = async (dealId, data, userId, role) => {
  const deal = await Deal.findById(dealId);

  if (!deal) {
    throw new ApiError(404, "Deal not found");
  }

  checkDealAccess(deal, userId, role);

  checkClosedDeal(deal);

  if (data.customer !== undefined) {
    const customer = await validateCustomer(data.customer);

    if (role === "sales_executive") {
      if (
        !customer.assignedTo ||
        customer.assignedTo.toString() !== userId.toString()
      ) {
        throw new ApiError(403, "You can only use customers assigned to you");
      }
    }
  }

  if (data.assignedTo !== undefined) {
    await validateAssignedUser(data.assignedTo);

    if (
      role === "sales_executive" &&
      data.assignedTo.toString() !== userId.toString()
    ) {
      throw new ApiError(403, "You can only assign the deal to yourself");
    }
  }

  if (data.amount !== undefined && Number(data.amount) < 0) {
    throw new ApiError(400, "Deal amount cannot be negative");
  }

  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      deal[key] = data[key];
    }
  });

  await deal.save();

  return getDealById(dealId, userId, role);
};

const deleteDeal = async (dealId, userId, role) => {
  const deal = await Deal.findById(dealId);

  if (!deal) {
    throw new ApiError(404, "Deal not found");
  }

  checkDealAccess(deal, userId, role);

  checkClosedDeal(deal);

  await deal.deleteOne();
};

const updateDealStage = async (dealId, stage, userId, role) => {
  const deal = await Deal.findById(dealId);

  if (!deal) {
    throw new ApiError(404, "Deal not found");
  }

  checkDealAccess(deal, userId, role);

  checkClosedDeal(deal);

  deal.stage = stage;

  await deal.save();

  return getDealById(dealId, userId, role);
};

export {
  listDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  updateDealStage,
};
