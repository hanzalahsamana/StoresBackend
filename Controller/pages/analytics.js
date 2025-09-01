const { OrderModel } = require("../../Models/OrderModal");
const { PaymentHistoryModel } = require("../../Models/paymentHistoryModel");
const { StoreModal } = require("../../Models/StoreModal");
const { SubscriptionModel } = require("../../Models/subscriptionmodel");
const { UserModal } = require("../../Models/userModal");

module.exports = {
    getAnalyticsData: async (req, res) => {
        try {
            const [users, activeStores, suspendedStores] = await Promise.all([
                UserModal.countDocuments({ role: { $ne: "superAdmin" } }),
                StoreModal.countDocuments({ storeStatus: "Active" }),
                StoreModal.countDocuments({ storeStatus: "Suspended" }),
            ]);

            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const lastYear = new Date(now);
            lastYear.setFullYear(now.getFullYear() - 1);
            lastYear.setHours(0, 0, 0, 0);

            const [paymentsData] = await PaymentHistoryModel.aggregate([
                {
                    $facet: {
                        totalRevenue: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
                        monthlyRevenue: [
                            { $match: { createdAt: { $gte: startOfYear } } },
                            { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } }
                        ],
                        totalSales: [{ $count: "count" }],
                    },
                },
            ]);

            const signups = await UserModal.aggregate([
                { $match: { createdAt: { $gte: startOfYear } } },
                { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
            ]);

            const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
                const m = paymentsData.monthlyRevenue.find(x => x._id === i + 1);
                return m?.total || 0;
            });

            const monthlySignups = Array.from({ length: 12 }, (_, i) => {
                const s = signups.find(x => x._id === i + 1);
                return s?.count || 0;
            });

            const topStoresResult = await OrderModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: lastYear },
                        "paymentInfo.status": "paid"
                    }
                },
                {
                    $group: {
                        _id: "$storeRef",
                        totalSales: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { totalSales: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "stores",
                        localField: "_id",
                        foreignField: "_id",
                        as: "store"
                    }
                },
                { $unwind: "$store" },
                {
                    $project: {
                        _id: 0,
                        storeName: "$store.storeName",
                        totalSales: 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        labels: { $push: "$storeName" },
                        data: { $push: "$totalSales" }
                    }
                },
                { $project: { _id: 0, labels: 1, data: 1 } }
            ]);

            const topStores = topStoresResult[0] || { labels: [], data: [] };

            const planDist = await StoreModal.aggregate([
                { $group: { _id: "$plan", count: { $sum: 1 } } }
            ]);

            const subscriptionPlanResult = await SubscriptionModel.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                },
                {
                    $match: { count: { $gt: 0 } } // Only include plans with count > 0
                },
                {
                    $sort: { _id: 1 } // Optional: sort by plan name (Free, Basic, etc.)
                },
                {
                    $group: {
                        _id: null,
                        labels: { $push: "$_id" },
                        data: { $push: "$count" }
                    }
                },
                { $project: { _id: 0, labels: 1, data: 1 } }
            ]);

            const subscriptionPlan = subscriptionPlanResult[0] || { labels: [], data: [] };

            res.json({
                success: true,
                data: {
                    users,
                    activeStores,
                    suspendedStores,
                    totalRevenue: paymentsData.totalRevenue[0]?.total || 0,
                    totalSales: paymentsData.totalSales[0]?.count || 0,
                    monthlyRevenue,
                    monthlySignups,
                    topStores,
                    subscriptionPlan,
                }
            });

        } catch (err) {
            console.error("Dashboard Error:", err);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
};
