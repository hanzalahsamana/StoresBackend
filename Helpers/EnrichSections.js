const { CollectionModel } = require('../Models/CollectionModel');
const { ProductModel } = require('../Models/ProductModel');

const enrichSections = async (sections, storeId) => {
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

    if (sec.type === 'catalog') {
      const { variantsFilters = false, standardFilters = false } = sectionData;
      const query = { storeRef: storeId };

      // Fetch variants if needed
      if (variantsFilters) {
        const fetchTask = ProductModel.find(query, 'variations')
          .lean()
          .then((products) => {
            if (!products.length) {
              sec.sectionData.availableVariants = [];
              return;
            }

            const variantsMap = products.reduce((map, product) => {
              (product.variations || []).forEach((variation) => {
                const { name, options = [] } = variation;
                if (!map.has(name)) {
                  map.set(name, new Set());
                }
                options.forEach((opt) => map.get(name).add(opt));
              });
              return map;
            }, new Map());

            const availableVariants = Array.from(variantsMap.entries()).map(([name, optionsSet]) => ({
              name,
              options: Array.from(optionsSet),
            }));

            sec.sectionData.availableVariants = availableVariants;
          })
          .catch((err) => {
            console.error(`Error fetching variants for catalog section: ${sec._id}`, err);
            sec.sectionData.availableVariants = [];
          });

        fetchTasks.push(fetchTask);
      }

      // Fetch min and max price if standard filters are enabled
      if (standardFilters) {
        const fetchTask = ProductModel.find(query, 'price')
          .lean()
          .then((products) => {
            if (!products.length) {
              sec.sectionData.minPrice = 0;
              sec.sectionData.maxPrice = 0;
              return;
            }

            let minPrice = Infinity;
            let maxPrice = -Infinity;

            products.forEach((product) => {
              if (product.price < minPrice) minPrice = product.price;
              if (product.price > maxPrice) maxPrice = product.price;
            });

            sec.sectionData.minPrice = minPrice;
            sec.sectionData.maxPrice = maxPrice;
          })
          .catch((err) => {
            console.error(`Error fetching price range for catalog section: ${sec._id}`, err);
            sec.sectionData.minPrice = 0;
            sec.sectionData.maxPrice = 0;
          });

        fetchTasks.push(fetchTask);
      }
    }
  }

  await Promise.all(fetchTasks);
  return enrichedSections;
};

module.exports = { enrichSections };
