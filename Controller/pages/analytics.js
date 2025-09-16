const { OrderModel } = require("../../Models/OrderModal");
const { PaymentHistoryModel } = require("../../Models/paymentHistoryModel");
const { StoreModal } = require("../../Models/StoreModal");
const { SubscriptionModel } = require("../../Models/subscriptionmodel");
const { UserModal } = require("../../Models/userModal");

module.exports = {
  getDashboardData: async (req, res) => {
    try {
      const [users, activeStores, suspendedStores, activeSubscriptions] =
        await Promise.all([
          UserModal.countDocuments({ role: { $ne: "superAdmin" } }),
          StoreModal.countDocuments({ storeStatus: "active" }),
          StoreModal.countDocuments({ storeStatus: "suspended" }),
          SubscriptionModel.countDocuments({ status: "active" }), // ✅ New: Count active subscriptions
        ]);

      // -------------------------
      // Handle Date Range
      // -------------------------
      let { dateRange } = req.query;
      let startDate, endDate;

      if (dateRange) {
        const [start, end] = dateRange.split(" - ");
        startDate = new Date(start);
        endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
      }

      // -------------------------
      // Helper: group by month/day
      // -------------------------
      const getGroupFormat = (rangeDays) => {
        if (rangeDays <= 31) {
          return {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          };
        }
        return {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
      };

      // -------------------------
      // Payments (Revenue)
      // -------------------------
      let paymentsMatch = {};
      if (startDate && endDate) {
        paymentsMatch.createdAt = { $gte: startDate, $lte: endDate };
      }

      const rangeInDays =
        startDate && endDate
          ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
          : 365;

      const groupFormat = getGroupFormat(rangeInDays);

      const paymentsAgg = await PaymentHistoryModel.aggregate([
        { $match: paymentsMatch },
        {
          $group: {
            _id: groupFormat,
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      const revenueLabels = paymentsAgg.map((x) => {
        if (x._id.day) {
          const date = new Date(x._id.year, x._id.month - 1, x._id.day);
          return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
        return `${new Date(x._id.year, x._id.month - 1).toLocaleString(
          "en-US",
          { month: "short" }
        )}-${x._id.year}`;
      });

      const revenueData = paymentsAgg.map((x) => x.total);

      // -------------------------
      // Signups
      // -------------------------
      let signupsMatch = {};
      if (startDate && endDate) {
        signupsMatch.createdAt = { $gte: startDate, $lte: endDate };
      }

      const signupsAgg = await UserModal.aggregate([
        { $match: signupsMatch },
        {
          $group: {
            _id: groupFormat,
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      const signupLabels = signupsAgg.map((x) =>
        x._id.day
          ? `${x._id.day}-${x._id.month}-${x._id.year}`
          : `${x._id.month}-${x._id.year}`
      );
      const signupData = signupsAgg.map((x) => x.count);

      // -------------------------
      // Top Stores (kept as is - optional)
      // -------------------------
      let storeMatch = { "paymentInfo.status": "paid" };
      if (startDate && endDate) {
        storeMatch.createdAt = { $gte: startDate, $lte: endDate };
      }

      const topStoresResult = await OrderModel.aggregate([
        { $match: storeMatch },
        {
          $group: {
            _id: "$storeRef",
            totalSales: { $sum: "$totalAmount" },
          },
        },
        { $sort: { totalSales: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "stores",
            localField: "_id",
            foreignField: "_id",
            as: "store",
          },
        },
        { $unwind: "$store" },
        {
          $project: {
            _id: 0,
            storeName: "$store.storeName",
            totalSales: 1,
          },
        },
        {
          $group: {
            _id: null,
            labels: { $push: "$storeName" },
            data: { $push: "$totalSales" },
          },
        },
        { $project: { _id: 0, labels: 1, data: 1 } },
      ]);

      const topStores = topStoresResult[0] || { labels: [], data: [] };

      // -------------------------
      // Subscription Plan
      // -------------------------
      const subscriptionPlanResult = await SubscriptionModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gt: 0 } } },
        { $sort: { _id: 1 } },
        {
          $group: {
            _id: null,
            labels: { $push: "$_id" },
            data: { $push: "$count" },
          },
        },
        { $project: { _id: 0, labels: 1, data: 1 } },
      ]);

      const subscriptionPlan = subscriptionPlanResult[0] || {
        labels: [],
        data: [],
      };

      // -------------------------
      // Response
      // -------------------------
      res.json({
        success: true,
        data: {
          users,
          activeStores,
          suspendedStores,
          totalRevenue: revenueData.reduce((a, b) => a + b, 0),
          activeSubscriptions, // ✅ Replacing totalSales with activeSubscriptions count
          monthlyRevenue: { labels: revenueLabels, data: revenueData },
          monthlySignups: { labels: signupLabels, data: signupData },
          topStores,
          subscriptionPlan,
        },
      });
    } catch (err) {
      console.error("Dashboard Error:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
