import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  convertLeadToCustomer,
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customer.service.js";

const customerResponse = (customer) => ({
  id: customer._id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  company: customer.company,
  originalLead: customer.originalLead,
  assignedTo: customer.assignedTo,
  status: customer.status,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
});

const convertLead = asyncHandler(async (req, res) => {
  const customer = await convertLeadToCustomer(
    req.params.id,
    req.user.userId,
    req.user.role,
  );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Lead converted to customer successfully",
        customerResponse(customer),
      ),
    );
});

const getCustomers = asyncHandler(async (req, res) => {
  const result = await listCustomers(req.user.userId, req.user.role, req.query);

  res.status(200).json(
    new ApiResponse(200, "Customers fetched successfully", {
      customers: result.customers.map(customerResponse),
      pagination: result.pagination,
    }),
  );
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await getCustomerById(
    req.params.id,
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Customer fetched successfully",
        customerResponse(customer),
      ),
    );
});

const addCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, company, originalLead, assignedTo, status } =
    req.body;

  const customer = await createCustomer({
    name,
    email,
    phone,
    company,
    originalLead,
    assignedTo,
    status,
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Customer created successfully",
        customerResponse(customer),
      ),
    );
});

const editCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, company, assignedTo, status } = req.body;

  const customer = await updateCustomer(
    req.params.id,
    {
      name,
      email,
      phone,
      company,
      assignedTo,
      status,
    },
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Customer updated successfully",
        customerResponse(customer),
      ),
    );
});

const removeCustomer = asyncHandler(async (req, res) => {
  await deleteCustomer(req.params.id, req.user.userId, req.user.role);

  res.status(200).json(new ApiResponse(200, "Customer deleted successfully"));
});

export {
  convertLead,
  getCustomers,
  getCustomer,
  addCustomer,
  editCustomer,
  removeCustomer,
};
