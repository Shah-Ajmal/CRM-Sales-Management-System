import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import Activity from "../models/Activity.js";

const getDashboardStatistics = async () => {
  const [
    totalLeads,
    leadsByStatus,
    convertedLeads,
    totalCustomers,
    totalDeals,
    dealsByStage,
    wonDeals,
    lostDeals,
    totalDealAmount,
    pendingActivities,
  ] = await Promise.all([
    // Total leads
    Lead.countDocuments(),

    // Leads grouped by status
    Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]),

    // Converted leads
    Lead.countDocuments({
      status: "converted",
    }),

    // Total customers
    Customer.countDocuments(),

    // Total deals
    Deal.countDocuments(),

    // Deals grouped by stage
    Deal.aggregate([
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]),

    // Won deals
    Deal.countDocuments({
      stage: "won",
    }),

    // Lost deals
    Deal.countDocuments({
      stage: "lost",
    }),

    // Total deal amount
    Deal.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]),

    // Pending activities
    Activity.countDocuments({
      status: "pending",
    }),
  ]);

  return {
    leads: {
      total: totalLeads,
      byStatus: leadsByStatus.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      converted: convertedLeads,
    },

    customers: {
      total: totalCustomers,
    },

    deals: {
      total: totalDeals,
      byStage: dealsByStage.map((item) => ({
        stage: item._id,
        count: item.count,
      })),
      won: wonDeals,
      lost: lostDeals,
      totalAmount: totalDealAmount.length > 0 ? totalDealAmount[0].total : 0,
    },

    activities: {
      pending: pendingActivities,
    },
  };
};

export default getDashboardStatistics;
