const { paginate } = require("../../Helpers/pagination");
const { PaymentHistoryModel } = require("../../Models/paymentHistoryModel");
const { SubscriptionModel } = require("../../Models/subscriptionmodel");
const moment = require("moment");

module.exports = {

    updateSubscription: async (req, res) => {
        try {
            const body = req.body;
            const { imageUrl, amount, status } = body
            if (!body || Object.keys(body).length === 0) {
                return res.status(400).json({ message: "Data is required!" });
            }

            const { storeId } = req.params;

            const updatedSubscription = await SubscriptionModel.findOneAndUpdate(
                { storeRef: storeId },
                { status },
            );

            if (!updatedSubscription) {
                return res.status(400).json({ message: "Invalid store!" });
            }

            const newPaymentHistory = new PaymentHistoryModel({
                subscriptionId: updatedSubscription._id,
                amount,
                imageUrl,
                status: "pending"
            });

            newPaymentHistory.save()

            return res.status(200).json({
                message: "Subscription upgrade successfully!",
                data: updatedSubscription,
                success: true
            });
        } catch (e) {
            console.error("Error updating subscription!", e?.message || e);
            return res.status(500).json({
                message: "Something went wrong!",
                success: false
            });
        }
    },


    getSubscriptions: async (req, res) => {
        try {
            const { storeName, dateRange, status, page = 1, limit = 0 } = req.query;
            const filterQuery = {};
            const pipeline = [];

            if (status) {
                filterQuery.status = { $regex: status, $options: "i" };
            }

            if (dateRange) {
                const [startDateStr, endDateStr] = dateRange.split(" - ");
                const startDate = moment(startDateStr, "MMM DD YYYY").startOf("day");
                const endDate = moment(endDateStr, "MMM DD YYYY").endOf("day");
                filterQuery.createdAt = {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate(),
                };
            }

            pipeline.push({
                $lookup: {
                    from: "stores",
                    localField: "storeRef",
                    foreignField: "_id",
                    as: "store",
                },
            });

            pipeline.push({ $unwind: "$store" });

            pipeline.push({
                $lookup: {
                    from: "users",
                    localField: "store.userRef",
                    foreignField: "_id",
                    as: "user",
                },
            });

            pipeline.push({ $unwind: "$user" });

            if (storeName) {
                pipeline.push({
                    $match: {
                        "store.storeName": { $regex: storeName, $options: "i" },
                    },
                });
            }

            pipeline.push({
                $addFields: {
                    storeName: "$store.storeName",
                    email: "$user.email",
                },
            });

            const { data, pagination } = await paginate(
                SubscriptionModel,
                filterQuery,
                { limit, page, sort: { createdAt: -1 } },
                pipeline
            );
            return res.json({ success: true, data, pagination });
        } catch (e) {
            console.error("Error fetching subscriptions!", e?.message || e);
            return res
                .status(500)
                .json({ message: "Something went wrong!", success: false });
        }
    },

    toggleSubscriptionStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req?.body
            if (!status) {
                return res.status(400).json({ message: "Status is required!", success: false });
            }

            if (!id) {
                return res.status(400).json({ message: "Subscription Id is required!", success: false });
            }

            const subscription = await SubscriptionModel.findById(id);
            if (!subscription) {
                return res.status(400).json({ message: "Invalid subscription id!", success: false });
            }
            // const paymenthistory = await PaymentHistoryModel.findOneAndUpdate({ subscriptionId: subscription?._id })

            subscription.status = status;
            await subscription.save();
            const paymentStatus = status === "cancelled" ? "failed" : status === "active" ? "paid" : undefined;

            if (paymentStatus) {
                await PaymentHistoryModel.findOneAndUpdate(
                    { subscriptionId: subscription._id },
                    { status: paymentStatus }
                );
            }
            return res.status(200).json({ message: `Subscription ${subscription?.status?.toLowerCase()} successfully`, data: subscription, success: true });
        } catch (e) {
            console.error("Error toggling subscription status!", e?.message || e);
            return res.status(500).json({ message: "Something went wrong!", success: false });
        }
    },
};
