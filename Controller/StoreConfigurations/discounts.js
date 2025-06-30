const { getValidCouponDiscount } = require('../../Helpers/getValidDiscount');
const { ConfigurationModel } = require('../../Models/ConfigurationModel');

// Add Discount
const addDiscount = async (req, res) => {
  const { storeId } = req.params;
  const validateDiscount = req.body;

  try {
    let configuration = await ConfigurationModel.findOne({
      storeRef: storeId,
    });

    if (!configuration) {
      configuration = new ConfigurationModel({
        storeRef: storeId,
      });
    }

    if (validateDiscount.discountType === 'global' && configuration?.discounts.some((d) => d.discountType === 'global')) {
      return res.status(400).json({
        message: 'A global discount already exists. Only one global discount is allowed.',
      });
    }

    if (
      validateDiscount.discountType === 'coupon' &&
      configuration.discounts.some((d) => d.discountType === 'coupon' && d.name.toLowerCase() === validateDiscount.name.toLowerCase())
    ) {
      return res.status(400).json({
        message: 'A coupon with this name already exists.',
      });
    }

    configuration.discounts.push(validateDiscount);
    const savedConfiguration = await configuration.save();

    return res.status(200).json({
      message: 'Discount added successfully.',
      data: savedConfiguration?.discounts,
    });
  } catch (error) {
    console.error('Error adding discount:', error);
    return res.status(500).json({ message: error?.message });
  }
};

// Edit Discount
const editDiscount = async (req, res) => {
  const { storeId } = req.params;
  const { discountId } = req.query;
  const updatedDiscount = req.body;

  try {
    const configuration = await ConfigurationModel.findOne({
      storeRef: storeId,
    });
    if (!configuration) {
      return res.status(404).json({ message: 'Store Configuration not found.' });
    }

    const discount = configuration?.discounts.id(discountId);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found.' });
    }

    if (updatedDiscount.discountType === 'global') {
      const anotherGlobal = configuration.discounts.some((d) => d._id.toString() !== discountId && d.discountType === 'global');
      if (anotherGlobal) {
        return res.status(400).json({
          message: 'A global discount already exists. Only one global discount is allowed.',
        });
      }
    }

    if (updatedDiscount.discountType === 'coupon' && updatedDiscount.name) {
      const duplicateCoupon = configuration.discounts.some((d) => d.discountType === 'coupon' && d.name.toLowerCase() === updatedDiscount.name.toLowerCase());
      if (duplicateCoupon) {
        return res.status(400).json({
          message: 'A coupon with this name already exists.',
        });
      }
    }

    Object.assign(discount, updatedDiscount);
    const savedConfiguration = await configuration.save();

    return res.status(200).json({
      message: 'Discount updated successfully.',
      data: savedConfiguration?.discounts,
    });
  } catch (error) {
    console.error('Error editing discount:', error);
    return res.status(500).json({ message: error?.message });
  }
};

// Delete Discount
const deleteDiscount = async (req, res) => {
  const { storeId } = req.params;
  const { discountId } = req.query;

  if (!discountId) {
    return res.status(400).json({ message: 'Invalid or missing discount ID in query.' });
  }

  try {
    const configuration = await ConfigurationModel.findOne({
      storeRef: storeId,
    });

    if (!configuration) {
      return res.status(404).json({ message: 'Store Configuration not found.' });
    }

    const discount = configuration?.discounts.id(discountId);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found.' });
    }

    discount.deleteOne();
    const savedConfiguration = await configuration.save();

    return res.status(200).json({
      message: 'Discount deleted successfully.',
      data: savedConfiguration?.discounts,
    });
  } catch (error) {
    console.error('Error deleting discount:', error);
    return res.status(500).json({ message: error?.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { email, couponCode, totalAmount } = req.body;

    const configuration = await ConfigurationModel.findOne({ storeRef: storeId }).lean();

    const result = await getValidCouponDiscount({
      storeId,
      email,
      couponCode,
      totalAmount,
      allDiscounts: configuration?.discounts || [],
    });

    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully.',
      discount: result.discount,
    });
  } catch (error) {
    console.error('applyCoupon error:', error);
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = {
  addDiscount,
  editDiscount,
  deleteDiscount,
  applyCoupon,
};
