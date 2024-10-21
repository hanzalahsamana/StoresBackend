const { mongoose } = require("mongoose");
const orderSchema = require("../Models/OrderModal");

const addOrderData = async (req, res) => {
  const type = req.collectionType;
  const OrderModel = mongoose.model(
    type + "_Orders",
    orderSchema,
    type + "_Orders"
  );
  const newOrder = new OrderModel(req.body);
  try {
    const savedOrderData = await newOrder.save();
    return res.status(201).json(savedOrderData);
  } catch (e) {
    return res.status(500).json({ message: Object.values(e.errors)[0] });
  }
};
const getOrders = async (req, res) => {
  const type = req.collectionType;
  const orderId = req.query.orderId;
  if (orderId) {
    if (!mongoose.isValidObjectId(orderId)) {
      return res
        .status(400)
        .json({ message: "Invalid id OR id is not defined" });
    }
  }
  try {
    const OrderModel = mongoose.model(
      type + "_Orders",
      orderSchema,
      type + "_Orders"
    );
    if (!orderId) {
      const orderData = await OrderModel.find({});
      return res.status(201).json(orderData);
    }
    const orderData = await OrderModel.findById(orderId);
    if (!orderData) {
      return res.status(404).json({ message: "Order Data not found" });
    }

    return res.status(201).json(orderData);
  } catch (e) {
    return res.status(500).json({ message: Object.values(e.errors)[0] });
  }
};

module.exports = { addOrderData, getOrders };
