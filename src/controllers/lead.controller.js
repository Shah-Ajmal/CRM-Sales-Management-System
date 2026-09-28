import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  listLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  assignLead,
} from "../services/lead.service.js";

const leadResponse = (lead) => ({
  id: lead._id,
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  company: lead.company,
  source: lead.source,
  status: lead.status,
  priority: lead.priority,
  assignedTo: lead.assignedTo,
  notes: lead.notes,
  convertedToCustomer: lead.convertedToCustomer,
  convertedAt: lead.convertedAt,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
});

const getLeads = asyncHandler(async (req, res) => {
  const result = await listLeads(req.query, req.user.userId, req.user.role);

  res.status(200).json(
    new ApiResponse(200, "Leads fetched successfully", {
      leads: result.leads.map(leadResponse),
      pagination: result.pagination,
    }),
  );
});

const getLead = asyncHandler(async (req, res) => {
  const lead = await getLeadById(req.params.id, req.user.userId, req.user.role);

  res
    .status(200)
    .json(
      new ApiResponse(200, "Lead fetched successfully", leadResponse(lead)),
    );
});

const addLead = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    company,
    source,
    status,
    priority,
    assignedTo,
    notes,
  } = req.body;

  const lead = await createLead(
    {
      name,
      email,
      phone,
      company,
      source,
      status,
      priority,
      assignedTo,
      notes,
    },
    req.user.userId,
    req.user.role,
  );

  res
    .status(201)
    .json(
      new ApiResponse(201, "Lead created successfully", leadResponse(lead)),
    );
});

const editLead = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    company,
    source,
    status,
    priority,
    assignedTo,
    notes,
  } = req.body;

  const lead = await updateLead(
    req.params.id,
    {
      name,
      email,
      phone,
      company,
      source,
      status,
      priority,
      assignedTo,
      notes,
    },
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, "Lead updated successfully", leadResponse(lead)),
    );
});

const removeLead = asyncHandler(async (req, res) => {
  await deleteLead(req.params.id, req.user.userId, req.user.role);

  res.status(200).json(new ApiResponse(200, "Lead deleted successfully"));
});

const changeLeadStatus = asyncHandler(async (req, res) => {
  const lead = await updateLeadStatus(
    req.params.id,
    req.body.status,
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Lead status updated successfully",
        leadResponse(lead),
      ),
    );
});

const assignLeadToUser = asyncHandler(async (req, res) => {
  const lead = await assignLead(
    req.params.id,
    req.body.assignedTo,
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, "Lead assigned successfully", leadResponse(lead)),
    );
});

export {
  getLeads,
  getLead,
  addLead,
  editLead,
  removeLead,
  changeLeadStatus,
  assignLeadToUser,
};
