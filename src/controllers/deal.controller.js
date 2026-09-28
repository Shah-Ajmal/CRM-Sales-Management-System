import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  listDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  updateDealStage,
} from "../services/deal.service.js";

const dealResponse = (deal) => ({
  id: deal._id,
  title: deal.title,
  customer: deal.customer,
  assignedTo: deal.assignedTo,
  amount: deal.amount,
  stage: deal.stage,
  expectedClosingDate: deal.expectedClosingDate,
  description: deal.description,
  createdAt: deal.createdAt,
  updatedAt: deal.updatedAt,
});

const getDeals = asyncHandler(async (req, res) => {
  const result = await listDeals(req.user.userId, req.user.role, req.query);

  res.status(200).json(
    new ApiResponse(200, "Deals fetched successfully", {
      deals: result.deals.map(dealResponse),
      pagination: result.pagination,
    }),
  );
});

const getDeal = asyncHandler(async (req, res) => {
  const deal = await getDealById(req.params.id, req.user.userId, req.user.role);

  res
    .status(200)
    .json(
      new ApiResponse(200, "Deal fetched successfully", dealResponse(deal)),
    );
});

const addDeal = asyncHandler(async (req, res) => {
  const {
    title,
    customer,
    assignedTo,
    amount,
    stage,
    expectedClosingDate,
    description,
  } = req.body;

  const deal = await createDeal(
    {
      title,
      customer,
      assignedTo,
      amount,
      stage,
      expectedClosingDate,
      description,
    },
    req.user.userId,
    req.user.role,
  );

  const createdDeal = await getDealById(
    deal._id,
    req.user.userId,
    req.user.role,
  );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Deal created successfully",
        dealResponse(createdDeal),
      ),
    );
});

const editDeal = asyncHandler(async (req, res) => {
  const {
    title,
    customer,
    assignedTo,
    amount,
    stage,
    expectedClosingDate,
    description,
  } = req.body;

  const deal = await updateDeal(
    req.params.id,
    {
      title,
      customer,
      assignedTo,
      amount,
      stage,
      expectedClosingDate,
      description,
    },
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, "Deal updated successfully", dealResponse(deal)),
    );
});

const removeDeal = asyncHandler(async (req, res) => {
  await deleteDeal(req.params.id, req.user.userId, req.user.role);

  res.status(200).json(new ApiResponse(200, "Deal deleted successfully"));
});

const changeDealStage = asyncHandler(async (req, res) => {
  const deal = await updateDealStage(
    req.params.id,
    req.body.stage,
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Deal stage updated successfully",
        dealResponse(deal),
      ),
    );
});

export { getDeals, getDeal, addDeal, editDeal, removeDeal, changeDealStage };
