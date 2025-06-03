const { mongoose } = require("mongoose");
const { orderSchema } = require("../Models/OrderModal");
const {
  customerOrderDetail,
  adminOrderDetail,
} = require("../Helpers/EmailsToSend");
const { UserModal } = require("../Models/userModal");

const addOrderData = async (req, res) => {
  const type = req.collectionType;
  const OrderModel = mongoose.model(
    type + "_Orders",
    orderSchema,
    type + "_Orders"
  );
  try {
    const admin = await UserModal.findOne({ brandName: type });

    const newOrder = new OrderModel(req.body);
    await newOrder.save();
    await customerOrderDetail(
      { ...admin.toObject(), logo: newOrder?.to },
      newOrder?.customerInfo?.email,
      newOrder
    );
    await adminOrderDetail(
      { ...admin.toObject(), logo: newOrder?.to },
      admin.email,
      newOrder
    );
    return res.status(201).json(newOrder);
  } catch (e) {
    console.log(e);

    return res.status(500).json({ message: e.message });
  }
};

// get orders
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

// edit orders

const editOrderData = async (req, res) => {
  const orderId = req.query.id;
  const updateData = req.body;
  const type = req.collectionType;

  if (
    !mongoose.isValidObjectId(orderId) ||
    !updateData ||
    Object.keys(updateData).length === 0
  ) {
    return res.status(400).json({
      message: !mongoose.isValidObjectId(orderId)
        ? "ID is required or Invalid ID"
        : "Data is required",
    });
  }

  try {
    const OrderModel = mongoose.model(
      type + "_Orders",
      orderSchema,
      type + "_Orders"
    );

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    if (updateData.status) {
      order.orderInfo.status = updateData.status;
    }
    Object.assign(order, updateData);

    await order.save();

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addOrderData, getOrders, editOrderData };
