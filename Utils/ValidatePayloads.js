const generateStoreValidation = (store) => {
  const errors = {};

  if (!store.storeName || typeof store.storeName !== "string") {
    errors.storeName = "Store name is required and must be a string.";
  }

  if (!store.storeType || typeof store.storeType !== "string") {
    errors.storeType = "Store type is required and must be a string.";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: null };
};

module.exports = {
  generateStoreValidation,
};