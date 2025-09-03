const { paginate } = require("../../Helpers/pagination");
const { PaymentHistoryModel } = require("../../Models/paymentHistoryModel");

module.exports = {
  getInvoices: async (req, res) => {
    try {
      const { limit = 0, page = 1, status, dateRange } = req.query;
      const query = {};
      if (status) {
        query.status = { $regex: status, $options: "i" };
      }
      if (dateRange) {
        const [startDateStr, endDateStr] = dateRange.split(" - ");
        const startDate = moment(startDateStr, "MMM DD YYYY").startOf("day");
        const endDate = moment(endDateStr, "MMM DD YYYY").endOf("day");
        query.createdAt = {
          $gte: startDate.toDate(),
          $lte: endDate.toDate(),
        };
      }
      const { data, pagination } = await paginate(PaymentHistoryModel, query, {
        limit,
        page,
        sort: { createdAt: -1 },
      });
      return res
        .status(200)
        .json({ invoices: data, pagination, success: true });
    } catch (e) {
      console.error("Error fetching invoices!", e?.message || e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },

  getStoreInvoices: async (req, res) => {
    try {
      const { storeId } = req.params;
      const { limit = 0, page = 1 } = req.query;

      const totalInvoices = await PaymentHistoryModel.countDocuments({
        storeRef: storeId,
      });

      const { data, pagination } = await paginate(
        PaymentHistoryModel,
        { storeRef: storeId },
        {
          limit,
          page,
          sort: { createdAt: -1 },
          populate: [
            {
              path: "storeRef",
              populate: {
                path: "userRef",
                select: "email",
              },
            },
          ],
        }
      );

      const invoicesWithSerial = data.map((invoice, index) => {
        const serial = totalInvoices - ((page - 1) * limit + index);

        const email = invoice?.storeRef?.userRef?.email || null;

        const invoiceObj = invoice.toObject();
        delete invoiceObj.storeRef;

        return {
          ...invoiceObj,
          serial,
          email,
        };
      });

      return res.status(200).json({
        invoices: invoicesWithSerial,
        pagination,
        success: true,
      });
    } catch (e) {
      console.error("Error fetching store invoices!", e?.message || e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },
};
