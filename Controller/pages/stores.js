const { storeStatusTemplate } = require('../../Emails/emailTemplates');
const { sendEmail } = require('../../Helpers/EmailSender');
const { getCounts } = require('../../Helpers/getCounts');
const { paginate } = require('../../Helpers/pagination');
const { searchSuggestion } = require('../../Helpers/searchSuggest');
const { StoreModal } = require('../../Models/StoreModal');
const moment = require('moment');

module.exports = {
  getStores: async (req, res) => {
    try {
      const { storeName, plan, dateRange, status, page = 1, limit = 0 } = req.query;
      const filterQuery = {};

      if (storeName) {
        filterQuery.storeName = { $regex: storeName, $options: 'i' };
      }
      if (status !== 'all') {
        filterQuery.storeStatus = { $regex: status, $options: 'i' };
      }
      if (dateRange) {
        const [startDateStr, endDateStr] = dateRange.split(' - ');
        const startDate = moment(startDateStr, 'MMM DD YYYY').startOf('day');
        const endDate = moment(endDateStr, 'MMM DD YYYY').endOf('day');
        filterQuery.createdAt = {
          $gte: startDate.toDate(),
          $lte: endDate.toDate(),
        };
      }

      let pipeline = [];
      if (plan) {
        pipeline.push({
          $lookup: {
            from: 'subscriptions',
            localField: 'subscriptionId',
            foreignField: '_id',
            as: 'subscription',
          },
        });
        pipeline.push({ $unwind: '$subscription' });
        pipeline.push({
          $match: { 'subscription.status': { $regex: plan, $options: 'i' } },
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
            { path: 'userRef', select: 'email -_id' },
            { path: 'subscriptionId', select: '-_id' },
          ],
        },
        pipeline
      );

      const data = rawData.map((store) => {
        const storeObj = typeof store.toObject === 'function' ? store.toObject() : store;
        const { userRef, subscription, subscriptionId, ...rest } = storeObj;
        return {
          ...rest,
          ...userRef,
          subscriptionStatus: subscription?.status || subscriptionId?.status,
        };
      });
      const counts = await getCounts(StoreModal, 'storeStatus');
      return res.status(200).json({ data, pagination, counts, success: true });
    } catch (e) {
      console.error('Error fetching stores!', e?.message || e);
      return res.status(500).json({ message: 'Something went wrong!', success: false });
    }
  },

  toggleStoreStatus: async (req, res) => {
    try {
      const { status, ids, reason } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Store IDs are required!', success: false });
      }

      if (!status) {
        return res.status(400).json({ message: 'Status is required!', success: false });
      }

      if (status === 'suspended' && !reason) {
        return res.status(400).json({ message: 'Reason is required!', success: false });
      }

      const stores = await StoreModal.find({ _id: { $in: ids } });
      if (!stores || stores.length === 0) {
        return res.status(400).json({ message: 'Invalid store Ids!', success: false });
      }

      await StoreModal.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            storeStatus: status.toLowerCase(),
            suspendedReason: status === 'suspended' ? reason : '',
          },
        }
      );

      const updatedStores = await StoreModal.find({
        _id: { $in: ids },
      }).populate('userRef');

      if (!updatedStores || updatedStores?.length === 0) {
        return res.status(404).json({ message: 'No stores found to update!', success: false });
      }

      const counts = await getCounts(StoreModal, 'storeStatus');

      const emailPromises = updatedStores.map((store) => {
        const subject = status === 'suspended' ? `Your ${store?.storeName} store Suspended - Immediate Attention Required` : `Your ${store?.storeName} store is Now Active!`;

        return sendEmail({ storeName: 'Admin Team', email: 'admin@example.com' }, store?.userRef?.email, subject, storeStatusTemplate(subject, status, reason, store?.storeName));
      });

      // Run in parallel
      await Promise.all(emailPromises);

      return res.status(200).json({
        message: `Store(s) ${status.toLowerCase()} successfully`,
        stores: updatedStores,
        counts,
        success: true,
      });
    } catch (e) {
      console.error('Error toggling store status!', e?.message || e);
      return res.status(500).json({ message: 'Something went wrong!', success: false });
    }
  },

  searchStores: async (req, res) => {
    try {
      const { searchQuery } = req?.query;
      const results = await searchSuggestion({
        Model: StoreModal,
        searchTerm: searchQuery,
        field: 'storeName',
        projection: { storeName: 1, _id: 0 },
      });
      const storesName = results.map((store) => store.storeName);
      return res.status(200).json({ data: storesName, success: true });
    } catch (e) {
      console.error('Error searching stores!', e?.message || e);
      return res.status(500).json({ message: 'Something went wrong!', success: false });
    }
  },
};
