const { paginate } = require("../../Helpers/pagination");
const { searchSuggestion } = require("../../Helpers/searchSuggest");
const { StoreModal } = require("../../Models/StoreModal");
const moment = require("moment");

module.exports = {
  getStores: async (req, res) => {
    try {
      const {
        storeName,
        plan,
        dateRange,
        status,
        page = 1,
        limit = 0,
      } = req.query;
      const filterQuery = {};

      if (storeName) {
        filterQuery.storeName = { $regex: storeName, $options: "i" };
      }
      if (status) {
        filterQuery.storeStatus = { $regex: status, $options: "i" };
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

      let pipeline = [];
      if (plan) {
        pipeline.push({
          $lookup: {
            from: "subscriptions",
            localField: "subscriptionId",
            foreignField: "_id",
            as: "subscription",
          },
        });
        pipeline.push({ $unwind: "$subscription" });
        pipeline.push({
          $match: { "subscription.status": { $regex: plan, $options: "i" } },
        });
      }

      const { data: rawData, pagination } = await paginate(
        StoreModal,
        filterQuery,
        {
          page,
          sort: { createdAt: -1 },
          limit,
          populate: [
            { path: "userRef", select: "email -_id" },
            { path: "subscriptionId", select: "-_id" },
          ],
        },
        pipeline
      );

      const data = rawData.map((store) => {
        const storeObj =
          typeof store.toObject === "function" ? store.toObject() : store;
        const { userRef, subscription, subscriptionId, ...rest } = storeObj;
        return {
          ...rest,
          ...userRef,
          subscriptionStatus: subscription?.status || subscriptionId?.status,
        };
      });
      console.log("rawData", rawData);

      return res.status(200).json({ data, pagination, success: true });
    } catch (e) {
      console.error("Error fetching stores!", e?.message || e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },

  toggleStoreStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req?.body;
      if (!status) {
        return res
          .status(400)
          .json({ message: "Status is required!", success: false });
      }

      if (!id) {
        return res
          .status(400)
          .json({ message: "Store Id is required!", success: false });
      }

      console.log("id==>", id);

      const store = await StoreModal.findById(id);
      console.log("store==>", store);
      if (!store) {
        return res
          .status(400)
          .json({ message: "Invalid store id!", success: false });
      }

      store.storeStatus = status;
      await store.save();
      return res.status(200).json({
        message: `Store ${store?.storeStatus?.toLowerCase()} successfully`,
        updatedStore: store,
        success: true,
      });
    } catch (e) {
      console.error("Error toggling store status!", e?.message || e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },

  searchStores: async (req, res) => {
    try {
      const { searchQuery } = req?.query;
      const results = await searchSuggestion({
        Model: StoreModal,
        searchTerm: searchQuery,
        field: "storeName",
        projection: { storeName: 1, _id: 0 },
      });
      const storesName = results.map((store) => store.storeName);
      return res.status(200).json({ data: storesName, success: true });
    } catch (e) {
      console.error("Error searching stores!", e?.message || e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },
};
