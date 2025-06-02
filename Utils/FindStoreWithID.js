export const FindStoreWithID = (StoreID) => {
  if (!stores || !Array.isArray(stores) || stores.length === 0) {
    return null;
  }

  const store = stores.find(
    (store) => store._id && store._id.toString() === id
  );

  return store || null;
};
