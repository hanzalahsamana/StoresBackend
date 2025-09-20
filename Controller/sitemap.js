const { CollectionModel } = require("../Models/CollectionModel");
const { ProductModel } = require("../Models/ProductModel");
const { StoreModal } = require("../Models/StoreModal");

module.exports = {
  getSitemapData: async (req, res) => {
    try {
      const { storeId } = req.params;

      // 1. Store fetch karo
      const store = await StoreModal.findById(storeId);
      if (!store) return res.status(404).send("Store not found");

      // 2. Store ke products fetch karo
      const products = await ProductModel.find({ storeRef: storeId });

      // 3. Store ke collections fetch karo
      const collections = await CollectionModel.find({ storeRef: storeId });

      // 4. XML generate karne ke liye
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Store homepage
      xml += `<url>\n<loc>${
        store.customDomain || `https://${store.subDomain}.designsli.com`
      }</loc>\n`;
      xml += `<lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += `<priority>1.0</priority>\n</url>\n`;

      // Products
      products.forEach((product) => {
        xml += `<url>\n<loc>${
          store.customDomain || `https://${store.subDomain}.designsli.com`
        }/product/${product.name}</loc>\n`;
        xml += `<lastmod>${product.updatedAt.toISOString()}</lastmod>\n`;
        xml += `<priority>0.8</priority>\n</url>\n`;
      });

      // Collections
      collections.forEach((collection) => {
        xml += `<url>\n<loc>${
          store.customDomain || `https://${store.subDomain}.designsli.com`
        }/collection/${collection.slug}</loc>\n`;
        xml += `<lastmod>${collection.updatedAt.toISOString()}</lastmod>\n`;
        xml += `<priority>0.7</priority>\n</url>\n`;
      });

      xml += `</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },
};
