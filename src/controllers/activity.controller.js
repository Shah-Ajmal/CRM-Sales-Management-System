import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  listActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  completeActivity,
} from "../services/activity.service.js";

const activityResponse = (activity) => ({
  id: activity._id,
  subject: activity.subject,
  description: activity.description,
  type: activity.type,
  status: activity.status,
  dueDate: activity.dueDate,
  assignedTo: activity.assignedTo,
  relatedLead: activity.relatedLead,
  relatedCustomer: activity.relatedCustomer,
  relatedDeal: activity.relatedDeal,
  createdAt: activity.createdAt,
  updatedAt: activity.updatedAt,
});

const getActivities = asyncHandler(async (req, res) => {
  const result = await listActivities(
    req.user.userId,
    req.user.role,
    req.query,
  );

  res.status(200).json(
    new ApiResponse(200, "Activities fetched successfully", {
      activities: result.activities.map(activityResponse),

      pagination: result.pagination,
    }),
  );
});

const getActivity = asyncHandler(async (req, res) => {
  const activity = await getActivityById(
    req.params.id,
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Activity fetched successfully",
        activityResponse(activity),
      ),
    );
});

const addActivity = asyncHandler(async (req, res) => {
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
  } = req.body;

  const activity = await createActivity(
    {
      subject,
      description,
      type,
      status,
      dueDate,
      assignedTo,
      relatedLead,
      relatedCustomer,
      relatedDeal,
    },
    req.user.userId,
    req.user.role,
  );

  const createdActivity = await getActivityById(
    activity._id,
    req.user.userId,
    req.user.role,
  );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Activity created successfully",
        activityResponse(createdActivity),
      ),
    );
});

const editActivity = asyncHandler(async (req, res) => {
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
  } = req.body;

  const activity = await updateActivity(
    req.params.id,
    {
      subject,
      description,
      type,
      status,
      dueDate,
      assignedTo,
      relatedLead,
      relatedCustomer,
      relatedDeal,
    },
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Activity updated successfully",
        activityResponse(activity),
      ),
    );
});

const removeActivity = asyncHandler(async (req, res) => {
  await deleteActivity(req.params.id, req.user.userId, req.user.role);

  res.status(200).json(new ApiResponse(200, "Activity deleted successfully"));
});

const markActivityCompleted = asyncHandler(async (req, res) => {
  const activity = await completeActivity(
    req.params.id,
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Activity marked as completed",
        activityResponse(activity),
      ),
    );
});

export {
  getActivities,
  getActivity,
  addActivity,
  editActivity,
  removeActivity,
  markActivityCompleted,
};
