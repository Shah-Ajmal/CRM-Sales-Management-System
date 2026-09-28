import Activity from "../models/Activity.js";
import User from "../models/User.js";
import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";

import ApiError from "../utils/ApiError.js";

const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "dueDate",
  "subject",
  "status",
  "type",
];

const validateAssignedUser = async (assignedTo) => {
  if (!assignedTo) {
    throw new ApiError(400, "Assigned user is required");
  }

  const user = await User.findById(assignedTo);

  if (!user) {
    throw new ApiError(404, "Assigned user not found");
  }

  if (user.role !== "sales_executive") {
    throw new ApiError(
      400,
      "Activity can only be assigned to a Sales Executive",
    );
  }

  if (!user.isActive) {
    throw new ApiError(400, "Assigned user is inactive");
  }

  return user;
};

const validateRelatedResources = async ({
  relatedLead,
  relatedCustomer,
  relatedDeal,
}) => {
  const resources = [relatedLead, relatedCustomer, relatedDeal].filter(
    (value) => value !== undefined && value !== null,
  );

  if (resources.length === 0) {
    throw new ApiError(
      400,
      "Activity must be related to a lead, customer, or deal",
    );
  }

  if (resources.length > 1) {
    throw new ApiError(400, "Activity can only be related to one CRM resource");
  }

  if (relatedLead) {
    const lead = await Lead.findById(relatedLead);

    if (!lead) {
      throw new ApiError(404, "Related lead not found");
    }
  }

  if (relatedCustomer) {
    const customer = await Customer.findById(relatedCustomer);

    if (!customer) {
      throw new ApiError(404, "Related customer not found");
    }
  }

  if (relatedDeal) {
    const deal = await Deal.findById(relatedDeal);

    if (!deal) {
      throw new ApiError(404, "Related deal not found");
    }
  }
};

const validateActivityAccess = (activity, currentUserId, currentUserRole) => {
  if (currentUserRole === "admin") {
    return;
  }

  if (activity.assignedTo.toString() !== currentUserId.toString()) {
    throw new ApiError(
      403,
      "You do not have permission to access this activity",
    );
  }
};

const listActivities = async (currentUserId, currentUserRole, query) => {
  const {
    search = "",
    type,
    status,
    assignedTo,
    relatedLead,
    relatedCustomer,
    relatedDeal,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter = {};

  /*
   * Sales Executives can only see
   * activities assigned to themselves.
   */
  if (currentUserRole === "sales_executive") {
    filter.assignedTo = currentUserId;
  }

  /*
   * Admin can optionally filter activities
   * by assigned user.
   */
  if (currentUserRole === "admin" && assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (type) {
    filter.type = type;
  }

  if (status) {
    filter.status = status;
  }

  if (relatedLead) {
    filter.relatedLead = relatedLead;
  }

  if (relatedCustomer) {
    filter.relatedCustomer = relatedCustomer;
  }

  if (relatedDeal) {
    filter.relatedDeal = relatedDeal;
  }

  if (search) {
    filter.$or = [
      {
        subject: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const pageNumber = Math.max(Number(page), 1);

  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : "createdAt";

  const safeSortOrder = sortOrder === "asc" ? 1 : -1;

  const sort = {
    [safeSortBy]: safeSortOrder,
  };

  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .populate("assignedTo", "name email role isActive")
      .populate("relatedLead", "name email phone company status")
      .populate("relatedCustomer", "name email phone company status")
      .populate("relatedDeal", "title amount stage customer assignedTo")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),

    Activity.countDocuments(filter),
  ]);

  return {
    activities,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getActivityById = async (activityId, currentUserId, currentUserRole) => {
  const activity = await Activity.findById(activityId)
    .populate("assignedTo", "name email role isActive")
    .populate("relatedLead", "name email phone company status")
    .populate("relatedCustomer", "name email phone company status")
    .populate("relatedDeal", "title amount stage customer assignedTo");

  if (!activity) {
    throw new ApiError(404, "Activity not found");
  }

  /*
   * Because assignedTo is populated,
   * compare its _id with the logged-in user.
   */
  if (currentUserRole !== "admin") {
    if (activity.assignedTo._id.toString() !== currentUserId.toString()) {
      throw new ApiError(
        403,
        "You do not have permission to access this activity",
      );
    }
  }

  return activity;
};

const createActivity = async (data, currentUserId, currentUserRole) => {
  const {
    subject,
    description,
    type,
    status,
    dueDate,
    assignedTo,
    relatedLead,
    relatedCustomer,
    relatedDeal,
  } = data;

  let finalAssignedTo = assignedTo;

  /*
   * Sales Executive activities are always
   * assigned to the logged-in Sales Executive.
   */
  if (currentUserRole === "sales_executive") {
    finalAssignedTo = currentUserId;
  }

  /*
   * Admin must explicitly provide an assignee.
   */
  if (currentUserRole === "admin" && !assignedTo) {
    throw new ApiError(400, "Assigned user is required");
  }

  await validateAssignedUser(finalAssignedTo);

  await validateRelatedResources({
    relatedLead,
    relatedCustomer,
    relatedDeal,
  });

  const activity = await Activity.create({
    subject,
    description,
    type,
    status,
    dueDate,
    assignedTo: finalAssignedTo,
    relatedLead: relatedLead || null,
    relatedCustomer: relatedCustomer || null,
    relatedDeal: relatedDeal || null,
  });

  return activity;
};

const updateActivity = async (
  activityId,
  data,
  currentUserId,
  currentUserRole,
) => {
  const activity = await Activity.findById(activityId);

  if (!activity) {
    throw new ApiError(404, "Activity not found");
  }

  validateActivityAccess(activity, currentUserId, currentUserRole);

  /*
   * Completed activities are locked.
   */
  if (activity.status === "completed") {
    throw new ApiError(400, "Completed activities cannot be modified");
  }

  const {
    subject,
    description,
    type,
    status,
    dueDate,
    assignedTo,
    relatedLead,
    relatedCustomer,
    relatedDeal,
  } = data;

  /*
   * Keep existing values when they are not
   * supplied in a PATCH request.
   */
  const finalAssignedTo =
    assignedTo !== undefined ? assignedTo : activity.assignedTo;

  const finalRelatedLead =
    relatedLead !== undefined ? relatedLead : activity.relatedLead;

  const finalRelatedCustomer =
    relatedCustomer !== undefined ? relatedCustomer : activity.relatedCustomer;

  const finalRelatedDeal =
    relatedDeal !== undefined ? relatedDeal : activity.relatedDeal;

  /*
   * Sales Executives cannot transfer an activity
   * to another user.
   */
  if (currentUserRole === "sales_executive") {
    if (finalAssignedTo.toString() !== currentUserId.toString()) {
      throw new ApiError(
        403,
        "Sales Executives can only assign activities to themselves",
      );
    }
  }

  await validateAssignedUser(finalAssignedTo);

  await validateRelatedResources({
    relatedLead: finalRelatedLead,
    relatedCustomer: finalRelatedCustomer,
    relatedDeal: finalRelatedDeal,
  });

  /*
   * Update only fields that were actually
   * provided in the request.
   */
  if (subject !== undefined) {
    activity.subject = subject;
  }

  if (description !== undefined) {
    activity.description = description;
  }

  if (type !== undefined) {
    activity.type = type;
  }

  if (status !== undefined) {
    activity.status = status;
  }

  if (dueDate !== undefined) {
    activity.dueDate = dueDate;
  }

  if (assignedTo !== undefined) {
    activity.assignedTo = finalAssignedTo;
  }

  if (relatedLead !== undefined) {
    activity.relatedLead = finalRelatedLead;
  }

  if (relatedCustomer !== undefined) {
    activity.relatedCustomer = finalRelatedCustomer;
  }

  if (relatedDeal !== undefined) {
    activity.relatedDeal = finalRelatedDeal;
  }

  await activity.save();

  return activity;
};

const deleteActivity = async (activityId, currentUserId, currentUserRole) => {
  const activity = await Activity.findById(activityId);

  if (!activity) {
    throw new ApiError(404, "Activity not found");
  }

  validateActivityAccess(activity, currentUserId, currentUserRole);

  /*
   * Completed activities cannot be deleted.
   */
  if (activity.status === "completed") {
    throw new ApiError(400, "Completed activities cannot be deleted");
  }

  await Activity.findByIdAndDelete(activityId);

  return activity;
};

const completeActivity = async (activityId, currentUserId, currentUserRole) => {
  const activity = await Activity.findById(activityId);

  if (!activity) {
    throw new ApiError(404, "Activity not found");
  }

  validateActivityAccess(activity, currentUserId, currentUserRole);

  if (activity.status === "completed") {
    throw new ApiError(400, "Activity is already completed");
  }

  activity.status = "completed";

  await activity.save();

  return activity;
};

export {
  listActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  completeActivity,
};
