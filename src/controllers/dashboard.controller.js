import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import getDashboardStatistics from "../services/dashboard.service.js";

const getDashboard = asyncHandler(async (req, res) => {
  const statistics = await getDashboardStatistics();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Dashboard statistics fetched successfully",
        statistics,
      ),
    );
});

export { getDashboard };
