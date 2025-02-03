const dns = require("dns");

const verifyDomain = async (req, res) => {
  const { domain } = req.query;
  console.log(domain);
  

  if (!domain) {
    return res.status(400).json({ message: "Domain is required" });
  }

  dns.resolveCname(`www.${domain}`, (err, addresses) => {
    if (err) {
      return res
        .status(500)
        .json({ message: `Error verifying domain ${domain}: ${err.message}` });
    }


    if (addresses.includes("stores-admin-panel.vercel.app")) {
      return res.status(200).json({
        success: true,
        message: `Domain ${domain} is verified successfully.`,
      });
    } else {
      return res.status(400).json({
        message: `Domain ${domain} verification failed. CNAME does not match.`,
      });
    }
  });
};

module.exports = { verifyDomain };
