const OrderModal = require("../Models/OrderModal");

const addOrderData = async (req, res) => {
  const orderModal = new OrderModal(req.body);
  try {
    const savedOrderData = await orderModal.save();
    await orderModal.save();
    return res.status(201).json(savedOrderData);
  } catch (e) {
    return res.status(500).json({ message: Object.values(e.errors)[0] });
  }
};

module.exports = { addOrderData };
