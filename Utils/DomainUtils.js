const { Vercel_IP, Vercel_Cname } = require('../Enums/Enums');
const { StoreModal } = require('../Models/StoreModal');

const isValidDomainConfigs = (configs, domain) => {
  if (!configs || configs?.error || Object.keys(configs).length === 0) {
    return { status: false, recommended: 'Domain ' + domain + ' is invalid.' };
  }
  if (domain && !domain?.includes('www')) {
    const isValidIP = configs?.aValues?.includes(Vercel_IP);
    return {
      status: isValidIP,
      recommended: 'A record should point to ' + Vercel_IP,
      steps: {
        type: 'A',
        name: '@',
        value: Vercel_IP,
        TTL: 14400,
      },
    };
  }
  if (domain && domain?.includes('www')) {
    const isValidCname = configs?.cnames?.includes(Vercel_Cname);
    return {
      status: isValidCname,
      recommended: 'CNAME record should point to ' + Vercel_Cname,
      steps: {
        type: 'CNAME',
        name: 'www',
        value: Vercel_Cname,
        TTL: 14400,
      },
    };
  }
  return false;
};

const updateDomainToDatabase = async (storeId, domain, isDomainVerified) => {
  try {
    if (!storeId) {
      throw new Error(`store Id is required`);
    }
    const store = await StoreModal.findById(storeId);

    if (!store) {
      throw new Error(`No store found with id: ${storeId}`);
    }

    store.customDomain = domain;
    store.isDomainVerified = isDomainVerified;
    await store.save();

    return { success: true, message: 'Domain updated successfully' };
  } catch (error) {
    console.error('Error updating domain:', error);
    throw new Error(`Error occurred while adding domain: ${error.message}`);
  }
};

module.exports = { isValidDomainConfigs, updateDomainToDatabase };
