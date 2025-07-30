const { CollectionModel } = require('../Models/CollectionModel');
const { ProductModel } = require('../Models/ProductModel');

const enrichSectionsWithProducts = async (sections, storeId) => {
  const enrichedSections = [...sections];
  const fetchTasks = [];

  for (const sec of enrichedSections) {
    if (!sec?.sectionData) continue;

    const { sectionData } = sec;

    if (sec.type === 'feature_product') {
      const {
        productCount = 4,
        productsToShow = 'all',
        selectedCollections = [], // assumed array of IDs
      } = sectionData;
      // Prepare query
      let query = { storeRef: storeId }; // always filter by store
      if (productsToShow === 'collections' && selectedCollections.length > 0) {
        query.collections = { $in: selectedCollections };
      }

      const fetchTask = ProductModel.find(query)
        .limit(productCount)
        .lean()
        .then((products) => {
          sec.sectionData.products = products || [];
        })
        .catch((err) => {
          console.error('Mongoose error fetching products for section:', sec._id, err);
          sec.sectionData.products = [];
        });

      fetchTasks.push(fetchTask);
    }

    if (sec.type === 'feature_collection') {
      const { collectionIds = [] } = sectionData;
      let query = { storeRef: storeId }; // always filter by store
      if (collectionIds.length > 0) {
        query._id = { $in: collectionIds };
      }

      const fetchTask = CollectionModel.find(query)
        .lean()
        .then((collections) => {
          sec.sectionData.collections = collections || [];
        })
        .catch((err) => {
          console.error('Mongoose error fetching collections for section:', sec._id, err);
          sec.sectionData.collections = [];
        });

      fetchTasks.push(fetchTask);
    }
  }

  await Promise.all(fetchTasks);
  return enrichedSections;
};

module.exports = { enrichSectionsWithProducts };
