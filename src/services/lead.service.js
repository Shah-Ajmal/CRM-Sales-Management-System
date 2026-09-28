import Lead from "../models/Lead.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const validateAssignedUser = async (assignedTo) => {
  if (!assignedTo) {
    return null;
  }

  const user = await User.findById(assignedTo);

  if (!user) {
    throw new ApiError(404, "Assigned user not found");
  }

  if (user.role !== "sales_executive") {
    throw new ApiError(400, "Lead can only be assigned to a sales executive");
  }

  if (!user.isActive) {
    throw new ApiError(400, "Lead cannot be assigned to an inactive user");
  }

  return user;
};

const validateLeadAccess = (lead, currentUserId, currentUserRole) => {
  // Admin can access every lead
  if (currentUserRole === "admin") {
    return;
  }

  // Sales Executive can access only
  // leads assigned to themselves
  if (
    !lead.assignedTo ||
    lead.assignedTo._id.toString() !== currentUserId.toString()
  ) {
    throw new ApiError(403, "You do not have permission to access this lead");
  }
};

const listLeads = async (query, currentUserId, currentUserRole) => {
  const {
    search = "",
    status,
    priority,
    source,
    assignedTo,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter = {};

  if (currentUserRole === "sales_executive") {
    // Sales Executive can only see
    // their own assigned leads
    filter.assignedTo = currentUserId;
  }

  if (currentUserRole === "admin" && assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
      {
        company: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (source) {
    filter.source = source;
  }

  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      filter.createdAt.$lte = end;
    }
  }

  const pageNumber = Math.max(Number(page), 1);

  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const allowedSortFields = [
    "name",
    "email",
    "company",
    "status",
    "priority",
    "createdAt",
    "updatedAt",
  ];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const sort = {
    [safeSortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate("assignedTo", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),

    Lead.countDocuments(filter),
  ]);

  return {
    leads,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getLeadById = async (leadId, currentUserId, currentUserRole) => {
  const lead = await Lead.findById(leadId).populate(
    "assignedTo",
    "name email role",
  );

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // 🔐 ID Tampering Protection
  validateLeadAccess(lead, currentUserId, currentUserRole);

  return lead;
};

const createLead = async (data, currentUserId, currentUserRole) => {
  const existingLead = await Lead.findOne({
    email: data.email,
  });

  if (existingLead) {
    throw new ApiError(409, "A lead with this email already exists");
  }

  if (currentUserRole === "sales_executive") {
    // Sales Executive-created leads
    // automatically belong to themselves
    data.assignedTo = currentUserId;
  }

  if (data.assignedTo) {
    await validateAssignedUser(data.assignedTo);
  }

  return Lead.create(data);
};

const updateLead = async (leadId, data, currentUserId, currentUserRole) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  validateLeadAccess(lead, currentUserId, currentUserRole);

  if (currentUserRole === "sales_executive" && data.assignedTo !== undefined) {
    if (data.assignedTo.toString() !== currentUserId.toString()) {
      throw new ApiError(
        403,
        "Sales Executives cannot assign leads to another user",
      );
    }
  }

  if (data.email && data.email !== lead.email) {
    const emailExists = await Lead.findOne({
      email: data.email,
      _id: {
        $ne: leadId,
      },
    });

    if (emailExists) {
      throw new ApiError(409, "A lead with this email already exists");
    }
  }

  if (data.assignedTo !== undefined) {
    await validateAssignedUser(data.assignedTo);
  }

  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      lead[key] = data[key];
    }
  });

  await lead.save();

  return getLeadById(leadId, currentUserId, currentUserRole);
};

const deleteLead = async (leadId, currentUserId, currentUserRole) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  validateLeadAccess(lead, currentUserId, currentUserRole);

  await Lead.findByIdAndDelete(leadId);

  return lead;
};

const updateLeadStatus = async (
  leadId,
  status,
  currentUserId,
  currentUserRole,
) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  validateLeadAccess(lead, currentUserId, currentUserRole);

  lead.status = status;

  await lead.save();

  return getLeadById(leadId, currentUserId, currentUserRole);
};

const assignLead = async (
  leadId,
  assignedTo,
  currentUserId,
  currentUserRole,
) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  validateLeadAccess(lead, currentUserId, currentUserRole);

  if (currentUserRole === "sales_executive") {
    throw new ApiError(403, "Sales Executives cannot reassign leads");
  }

  await validateAssignedUser(assignedTo);

  lead.assignedTo = assignedTo;

  await lead.save();

  return getLeadById(leadId, currentUserId, currentUserRole);
};

export {
  listLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  assignLead,
};
