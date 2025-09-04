const { paginate } = require("../../Helpers/pagination");
const { PaymentHistoryModel } = require("../../Models/paymentHistoryModel");
const moment = require("moment");

module.exports = {
  getInvoices: async (req, res) => {
    try {
      const { limit = 0, page = 1, status, dateRange, email } = req.query;
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
        populate: [
          {
            path: "storeRef",
            populate: {
              path: "userRef",
              select: "email",
              match: email ? { email: { $regex: email, $options: "i" } } : {},
            },
          },
        ],
      });
      const filteredData = data.filter(
        (invoice) => invoice?.storeRef?.userRef?.email
      );

      const invoicesWithSerial = filteredData.map((invoice, index) => {
        const serial = pagination.total - ((page - 1) * limit + index);
        const email = invoice?.storeRef?.userRef?.email || null;
        const invoiceObj = invoice.toObject();
        delete invoiceObj.storeRef;

        return { ...invoiceObj, serial, email };
      });

      return res
        .status(200)
        .json({ data: invoicesWithSerial, pagination, success: true });
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

  toggleInvoiceStatus: async (req, res) => {
    try {
      const { id } = req?.params;
      const { status } = req?.body;
      if (!id) {
        return res.status(400).json({ message: "Invoice Id is required!" });
      }
      if (!status) {
        return res.status(400).json({ message: "Invoice Status is required!" });
      }
      const updatedInvoice = await PaymentHistoryModel.findByIdAndUpdate(
        id,
        { status: status.toLowerCase() },
        { new: true }
      );
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found!" });
      }
      return res.status(200).json({
        message: `Invoice ${status} successfully!`,
        updatedInvoice,
      });
    } catch (e) {
      console.error("Error toggling invoice status!", e?.message || e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },
};
