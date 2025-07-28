const { ProductModel } = require('../Models/ProductModel');

const enrichSectionsWithProducts = async (sections, storeId) => {
  const enrichedSections = [...sections];
  const fetchTasks = [];

  for (const sec of enrichedSections) {
    if (!sec?.sectionData) continue;

    const { sectionData } = sec;
    const {
      productCount = 4,
      productsToShow = 'all',
      selectedCollections = [], // assumed array of IDs
    } = sectionData;

    
    if (sec.type === 'feature_product') {
      // Prepare query
      let query = { storeRef: storeId }; // always filter by store
      if (productsToShow === 'collections' && selectedCollections.length > 0) {
        const collectionIds = selectedCollections.map((col) => col.value);
        query.collections = { $in: collectionIds };
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

    // Optional: add feature_collection handling if needed
    if (sec.type === 'feature_collection') {
      // similar Mongoose fetch from CollectionModel + related products
    }
  }

  await Promise.all(fetchTasks);
  return enrichedSections;
};

module.exports = { enrichSectionsWithProducts };
