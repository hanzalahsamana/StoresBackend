const mongoose = require('mongoose');
const moment = require('moment');
const { OrderModel } = require('../Models/OrderModal');
const { ConfigurationModel } = require('../Models/ConfigurationModel');
const { SubscriberModel } = require('../Models/SubscriberModal');

const getValidCouponDiscount = async ({ storeId, email, couponCode, totalAmount, allDiscounts }) => {
  if (!couponCode) throw { status: 400, message: 'Coupon code is required.' };
  if (totalAmount === undefined || isNaN(Number(totalAmount))) {
    throw { status: 400, message: 'Total amount must be a valid number.' };
  }
  if (Number(totalAmount) <= 0) {
    throw { status: 400, message: 'Total amount must be greater than 0.' };
  }

  if (!allDiscounts || allDiscounts.length === 0) {
    throw { status: 404, message: 'No discounts configured.' };
  }

  const discount = allDiscounts.find((d) => d.discountType === 'coupon' && d.name.toLowerCase() === couponCode.toLowerCase());

  if (!discount) {
    throw { status: 404, message: 'Invalid or inactive coupon code.' };
  }

  if (!discount.isActive || moment(discount.expiryDate).isBefore(moment())) {
    throw { status: 400, message: 'Expired or inactive coupon code.' };
  }

  if (discount.access === 'subscription') {
    if (!email) {
      throw { status: 400, message: 'Email is required for this coupon.' };
    }
    const existingUser = await SubscriberModel.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      throw { status: 400, message: 'Coupon valid only for subscribed users.' };
    }
  }

  if (discount.minOrderAmount && totalAmount < discount.minOrderAmount) {
    throw {
      status: 400,
      message: `Minimum order amount of Rs. ${discount.minOrderAmount} is required to use this coupon.`,
    };
  }

  if (discount.isFirstOrderOnly) {
    if (!email) {
      throw { status: 400, message: 'Email is required for this coupon.' };
    }
    const existingOrder = await OrderModel.findOne({ email: email.toLowerCase() });
    if (existingOrder) {
      throw {
        status: 400,
        message: 'Coupon valid only for first order customers.',
      };
    }
  }

  const discountAmount = discount.amountType === 'percent' ? (totalAmount * discount.amount) / 100 : discount.amount;

  return {
    success: true,
    amountType: discount.amountType,
    amount: discount.amount,
    discountAmount,
    name: discount.name,
  };
};

const getValidGlobalDiscount = ({ discounts, totalAmount }) => {
  const globalDiscount = discounts?.find((d) => d.discountType === 'global');

  if (globalDiscount) {
    const isActive = globalDiscount.isActive;
    const isNotExpired = new Date(globalDiscount.expiryDate) > new Date();
    const hasMinOrderAmount = globalDiscount.minOrderAmount;
    const isOrderEligible = !hasMinOrderAmount || totalAmount > globalDiscount.minOrderAmount;

    if (isActive && isNotExpired && isOrderEligible) {
      const discountAmount = globalDiscount.amountType === 'percent' ? (totalAmount * globalDiscount.amount) / 100 : globalDiscount.amount;
      return {
        amountType: globalDiscount.amountType,
        amount: globalDiscount.amount,
        discountAmount,
        name: globalDiscount.name,
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = { getValidCouponDiscount, getValidGlobalDiscount };
