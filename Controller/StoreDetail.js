const { StoreModal } = require('../Models/StoreModal');
const { UserModal } = require('../Models/userModal');
const SeedDefaultData = require('../InitialSeeding/SeedDefaultData');
const { compareHash } = require('../Utils/BCrypt');
const { deleteAllData } = require('../Helpers/deleteAllData');
const { SubscriberModel } = require('../Models/SubscriberModal');
const { SubscriptionModel } = require('../Models/subscriptionmodel');
const { generateUniquePromoCode } = require('../Helpers/generatePromoCode');
const { generateSlug } = require('../Utils/generateSlug');
const { Allowed_Themes } = require('../Enums/Enums');
const { ThemeLayoutModel } = require('../Models/ThemeLayoutModel');

const addReferralSubscriptionTime = async (referredStore) => {
  if (!referredStore?.subscriptionId) return;

  const subscription = await SubscriptionModel.findById(referredStore.subscriptionId);
  if (!subscription) return;

  const now = new Date();
  let monthsToAdd = 1;

  if (referredStore.refferals === 9) monthsToAdd = 2;

  if (subscription.status === 'active') {
    const currentEnd = subscription.subsEnd ? new Date(subscription.subsEnd) : now;
    subscription.subsEnd = new Date(currentEnd.setMonth(currentEnd.getMonth() + monthsToAdd));
  } else if (subscription.status === 'cancelled') {
    subscription.subsStart = now;
    subscription.subsEnd = new Date(now.setMonth(now.getMonth() + monthsToAdd));
  }

  subscription.status = 'active';

  await subscription.save();
};

const generateStore = async (req, res) => {
  const { userId } = req.query;
  const { storeName, storeType, subDomain, referralCode } = req.body;

  try {
    const uniqueSubDomain = await generateSlug(subDomain, StoreModal, 'subDomain');

    // if (isSubDomainExist) {
    //   return res.status(400).json({ message: "Sub domain already exists!", success: false });
    // }

    if (referralCode) {
      const referredStore = await StoreModal.findOne({
        promoCode: referralCode,
      });

      if (!referredStore) {
        return res.status(400).json({ message: 'Invalid Promo Code!', success: false });
      }

      if (referredStore?.refferals >= 10) {
        return res.status(400).json({
          message: "This store's referrals are already complete (10). Please use a new promo code.",
          success: false,
        });
      }

      await addReferralSubscriptionTime(referredStore);
      referredStore.refferals = (referredStore?.refferals || 0) + 1;
      await referredStore.save();
    }

    const promoCode = await generateUniquePromoCode(StoreModal);

    const newStore = new StoreModal({
      storeName,
      storeType,
      subDomain: uniqueSubDomain,
      userRef: userId,
      promoCode,
    });

    const savedStore = await newStore.save();
    const newSubscription = new SubscriptionModel({
      storeRef: savedStore._id,
      status: 'trial',
    });
    const savedSubscription = await newSubscription.save();
    savedStore.subscriptionId = savedSubscription._id;
    await savedStore.save();
    await SeedDefaultData(savedStore?._id);
    return res.status(201).json({
      success: true,
      data: savedStore,
    });
  } catch (error) {
    console.error('Error generating store:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const getStore = async (req, res) => {
  const { storeId } = req.params;
  const { isAdmin } = req.query;

  try {
    const storeData = await StoreModal.findById(storeId).populate('subscriptionId').populate('userRef'); // plain JS object banane ke liye

    const user = await UserModal.findById(storeData?.userRef);
    if (!storeData) {
      return res.status(400).json({ message: 'Invalid Store Id!', success: false });
    }
    let header = null;
    let footer = null;

    const layouts = await ThemeLayoutModel.find({
      storeRef: storeId,
      mode: 'published',
      name: { $in: ['header', 'footer'] },
    }).lean();

    header = layouts.find((l) => l.name === 'header')?.data || null;
    footer = layouts.find((l) => l.name === 'footer')?.data || null;
    if (isAdmin) {
      storeData.updatedAt = new Date();
      await storeData.save();
      user.lastOpenedStore = storeData?._id;
      await user.save();
    }
    return res.status(200).json({
      success: true,
      data: storeData,
      header,
      footer,
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const getAllStores = async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await UserModal.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No user found with ID: ${userId}`,
      });
    }

    const storeData = await StoreModal.find({
      userRef: userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: storeData,
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const editStore = async (req, res) => {
  try {
    const { storeName, subDomain } = req.body;
    const { storeId } = req.params;
    if (!req.body) {
      return res.status(400).json({ message: 'Data is required', success: false });
    }
    const isSubDomainExist = await StoreModal.findOne({ subDomain });

    if (isSubDomainExist) {
      return res.status(400).json({ message: 'Sub domain already exists!', success: false });
    }

    const store = await StoreModal.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: `Invalid Store Id!`, success: false });
    }
    store.storeName = storeName;
    const updatedStore = await store.save();
    return res.status(200).json({
      message: 'Store Updated succesfully',
      data: updatedStore,
      success: true,
    });
  } catch (e) {
    console.error('Error edit Store', e?.message || e);
    return res.status(500).json({ message: 'Something went wrong!', success: false });
  }
};

const editStoreAppearance = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { branding } = req.body;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    // Validate branding.theme if provided
    if (branding?.theme && !Allowed_Themes.includes(branding.theme)) {
      return res.status(400).json({
        message: `Invalid theme. Allowed values: ${Allowed_Themes.join(', ')}`,
      });
    }

    const updateData = {};
    if (branding) updateData.branding = branding;

    const updatedStore = await StoreModal.findByIdAndUpdate(storeId, { $set: updateData }, { new: true });

    if (!updatedStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.status(200).json({
      message: 'Store appearance updated successfully',
      branding: updatedStore?.branding,
    });
  } catch (error) {
    console.error('Error updating store appearance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { password } = req.query;

    if (!storeId || !password) {
      return res.status(400).json({
        message: 'Store ID and password are required',
        success: false,
      });
    }

    const store = await StoreModal.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found', success: false });
    }

    const user = await UserModal.findById(store.userRef).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    const isPasswordCorrect = await compareHash(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid password', success: false });
    }

    deleteAllData([storeId]);

    await StoreModal.findByIdAndDelete(storeId);

    return res.status(200).json({
      message: 'Store and all related data deleted successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error deleting store:', error?.message || error);
    return res.status(500).json({ message: 'Something went wrong!', success: false });
  }
};

module.exports = {
  generateStore,
  getAllStores,
  getStore,
  editStore,
  deleteStore,
  editStoreAppearance,
};
