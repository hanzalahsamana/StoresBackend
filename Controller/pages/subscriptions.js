const { default: mongoose } = require("mongoose");
const { paginate } = require("../../Helpers/pagination");
const { PaymentHistoryModel } = require("../../Models/paymentHistoryModel");
const { SubscriptionModel } = require("../../Models/subscriptionmodel");
const moment = require("moment");
const { getCounts } = require("../../Helpers/getCounts");

module.exports = {
  updateSubscription: async (req, res) => {
    try {
      const body = req.body;
      const { storeId } = req.params;
      if (!body || Object.keys(body).length === 0) {
        return res.status(400).json({ message: "Data is required!" });
      }

      if (!storeId) {
        return res.status(400).json({ message: "Store Id is required!" });
      }
      const { imageUrl, amount, status } = body;

      const updatedSubscription = await SubscriptionModel.findOneAndUpdate(
        { storeRef: storeId },
        { status, subsStart: null, subsEnd: null, billingCycle: null },
        { new: true }
      );

      if (!updatedSubscription) {
        return res.status(400).json({ message: "Invalid store!" });
      }

      const newPaymentHistory = new PaymentHistoryModel({
        storeRef: storeId,
        subscriptionId: updatedSubscription._id,
        amount,
        imageUrl,
        status: "pending",
      });

      newPaymentHistory.save();

      return res.status(200).json({
        message: "Subscription upgrade successfully!",
        data: updatedSubscription,
        success: true,
      });
    } catch (e) {
      console.error("Error updating subscription!", e?.message || e);
      return res.status(500).json({
        message: "Something went wrong!",
        success: false,
      });
    }
  },

  getSubscriptions: async (req, res) => {
    try {
      const {
        storeName,
        dateRange,
        status = "all",
        page = 1,
        limit = 0,
      } = req.query;
      const filterQuery = {};
      const pipeline = [];

      // tab filter
      if (status !== "all") {
        filterQuery.status = { $regex: status, $options: "i" };
      }

      // date filter
      if (dateRange) {
        const [startDateStr, endDateStr] = dateRange.split(" - ");
        const startDate = moment(startDateStr, "MMM DD YYYY").startOf("day");
        const endDate = moment(endDateStr, "MMM DD YYYY").endOf("day");
        filterQuery.createdAt = {
          $gte: startDate.toDate(),
          $lte: endDate.toDate(),
        };
      }

      // store + user lookup
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

      // store name filter
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

      // pagination data
      const { data, pagination } = await paginate(
        SubscriptionModel,
        filterQuery,
        { limit, page, sort: { createdAt: -1 } },
        pipeline
      );

      const counts = await getCounts(SubscriptionModel);

      return res.json({ success: true, data, pagination, counts });
    } catch (e) {
      console.error("Error fetching subscriptions!", e?.message || e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },

  toggleSubscriptionStatus: async (req, res) => {
    try {
      const { status, subscriptionIds } = req.body;

      if (!status) {
        return res
          .status(400)
          .json({ message: "Status is required!", success: false });
      }

      if (subscriptionIds?.length === 0 || !subscriptionIds) {
        return res
          .status(400)
          .json({ message: "Subscription Ids are required!", success: false });
      }

      const invalidIds = subscriptionIds.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidIds.length > 0) {
        return res
          .status(400)
          .json({ message: "Invalid subscription Id(s)!", success: false });
      }

      let updateData = {
        status:
          status.toLowerCase() === "cancel"
            ? "cancelled"
            : status.toLowerCase(),
      };

      if (status.toLowerCase() === "active") {
        updateData = {
          ...updateData,
          subsStart: new Date(),
          subsEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          billingCycle: "monthly",
          referralModalShown: true,
        };
      }

      await SubscriptionModel.updateMany(
        { _id: { $in: subscriptionIds } },
        { $set: updateData }
      );

      const updatedSubscriptions = await SubscriptionModel.find({
        _id: { $in: subscriptionIds },
      });

      const counts = await getCounts(SubscriptionModel);

      return res.status(200).json({
        message: `Subscriptions ${updateData.status} successfully`,
        subscriptions: updatedSubscriptions,
        counts,
        success: true,
      });
    } catch (e) {
      console.error("Error toggling subscription status!", e?.message || e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },

  updateReferralModal: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .json({ message: "Subscription id is required!", success: false });
      }
      const subscription = await SubscriptionModel.findByIdAndUpdate(
        id,
        {
          referralModalShown: false,
        },
        { new: true }
      );
      if (!subscription) {
        return res
          .status(404)
          .json({ message: "Subscription not found!", success: false });
      }
      return res.status(200).json({ data: subscription, success: true });
    } catch (e) {
      console.error("Error updating referralModal!", e?.message || e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },
};
