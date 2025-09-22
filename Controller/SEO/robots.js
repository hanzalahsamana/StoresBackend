const { StoreModal } = require("../../Models/StoreModal");

module.exports = {
  getRobotsTxt: async (req, res) => {
    try {
      const { storeId } = req.params;
      const { domain, subDomain } = req.query;
      if (!domain && !subDomain) {
        return res
          .status(400)
          .json({ message: "Domain is required!", success: false });
      }
      // Store fetch
      const store = await StoreModal.findById(storeId);
      if (!store) return res.status(404).send("Store not found");

      // Store ka base domain resolve
      const baseUrl = domain
        ? `https://${domain}`
        : `https://${subDomain}.designsli.com`;

      // Dynamic robots.txt content
      const robots = `
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

      res.header("Content-Type", "text/plain");
      res.send(robots);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },
};
