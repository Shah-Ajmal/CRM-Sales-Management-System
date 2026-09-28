import mongoose from "mongoose";

import Customer from "../models/Customer.js";
import Lead from "../models/Lead.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const checkCustomerAccess = (customer, userId, role) => {
  if (role === "admin") {
    return;
  }

  if (
    !customer.assignedTo ||
    customer.assignedTo._id.toString() !== userId.toString()
  ) {
    throw new ApiError(
      403,
      "You do not have permission to access this customer",
    );
  }
};

const convertLeadToCustomer = async (leadId, userId, role) => {
  const session = await mongoose.startSession();

  try {
    let convertedCustomer;

    await session.withTransaction(async () => {
      const lead = await Lead.findById(leadId).session(session);

      if (!lead) {
        throw new ApiError(404, "Lead not found");
      }

      if (role !== "admin") {
        if (
          !lead.assignedTo ||
          lead.assignedTo.toString() !== userId.toString()
        ) {
          throw new ApiError(403, "You can only convert leads assigned to you");
        }
      }

      if (lead.convertedToCustomer || lead.convertedCustomer) {
        throw new ApiError(409, "This lead has already been converted");
      }

      if (lead.status !== "qualified") {
        throw new ApiError(400, "Only qualified leads can be converted");
      }

      if (!lead.assignedTo) {
        throw new ApiError(
          400,
          "Lead must be assigned to a sales executive before conversion",
        );
      }

      const assignedUser = await User.findById(lead.assignedTo).session(
        session,
      );

      if (!assignedUser) {
        throw new ApiError(404, "Assigned sales executive not found");
      }

      if (assignedUser.role !== "sales_executive") {
        throw new ApiError(400, "Lead must be assigned to a sales executive");
      }

      if (!assignedUser.isActive) {
        throw new ApiError(
          400,
          "Lead is assigned to an inactive sales executive",
        );
      }

      const existingCustomer = await Customer.findOne({
        email: lead.email,
      }).session(session);

      if (existingCustomer) {
        throw new ApiError(409, "A customer with this email already exists");
      }

      const [customer] = await Customer.create(
        [
          {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            originalLead: lead._id,
            assignedTo: lead.assignedTo,
            status: "active",
          },
        ],
        { session },
      );

      lead.status = "converted";
      lead.convertedToCustomer = true;
      lead.convertedCustomer = customer._id;
      lead.convertedAt = new Date();

      await lead.save({ session });

      convertedCustomer = customer;
    });

    return Customer.findById(convertedCustomer._id)
      .populate("originalLead", "name email status")
      .populate("assignedTo", "name email role");
  } finally {
    await session.endSession();
  }
};

const listCustomers = async (userId, role, query) => {
  const {
    search = "",
    status,
    assignedTo,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter = {};

  // Sales executives can only see their own customers.
  if (role === "sales_executive") {
    filter.assignedTo = userId;
  }

  // Admin can optionally filter by assigned user.
  if (role === "admin" && assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  const allowedSortFields = [
    "name",
    "email",
    "company",
    "status",
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

  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .populate("originalLead", "name email status")
      .populate("assignedTo", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),

    Customer.countDocuments(filter),
  ]);

  return {
    customers,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getCustomerById = async (customerId, userId, role) => {
  const customer = await Customer.findById(customerId)
    .populate("originalLead", "name email status")
    .populate("assignedTo", "name email role");

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  checkCustomerAccess(customer, userId, role);

  return customer;
};

const createCustomer = async (data) => {
  const existingCustomer = await Customer.findOne({
    email: data.email,
  });

  if (existingCustomer) {
    throw new ApiError(409, "A customer with this email already exists");
  }

  const assignedUser = await User.findById(data.assignedTo);

  if (!assignedUser) {
    throw new ApiError(404, "Assigned user not found");
  }

  if (assignedUser.role !== "sales_executive") {
    throw new ApiError(400, "Customer must be assigned to a sales executive");
  }

  if (!assignedUser.isActive) {
    throw new ApiError(400, "Customer cannot be assigned to an inactive user");
  }

  const customer = await Customer.create(data);

  return getCustomerById(customer._id, data.assignedTo, "sales_executive");
};

const updateCustomer = async (customerId, data, userId, role) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  checkCustomerAccess(customer, userId, role);

  if (data.email && data.email !== customer.email) {
    const existingCustomer = await Customer.findOne({
      email: data.email,
      _id: { $ne: customerId },
    });

    if (existingCustomer) {
      throw new ApiError(409, "A customer with this email already exists");
    }
  }

  if (data.assignedTo !== undefined) {
    const assignedUser = await User.findById(data.assignedTo);

    if (!assignedUser) {
      throw new ApiError(404, "Assigned user not found");
    }

    if (assignedUser.role !== "sales_executive") {
      throw new ApiError(400, "Customer must be assigned to a sales executive");
    }

    if (!assignedUser.isActive) {
      throw new ApiError(
        400,
        "Customer cannot be assigned to an inactive user",
      );
    }
  }

  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      customer[key] = data[key];
    }
  });

  await customer.save();

  return getCustomerById(customer._id, userId, role);
};

const deleteCustomer = async (customerId, userId, role) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  checkCustomerAccess(customer, userId, role);

  await customer.deleteOne();
};

export {
  convertLeadToCustomer,
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
