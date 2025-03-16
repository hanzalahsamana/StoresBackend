const dns = require("dns");

const checkDomainDNS = (domain) => {
  return new Promise((resolve) => {
    const resolver = new dns.Resolver();
    resolver.setServers(["8.8.8.8"]);

    resolver.resolve4(domain, (err, addresses) => {
      if (err) {
        if (err.code === "ENODATA" || err.code === "ENOTFOUND") {
          console.warn(`No DNS records found for domain ${domain}`);
          return resolve([]);
        }
        console.error(`Error resolving DNS for domain ${domain}:`, err);
        return resolve([]);
      }
      resolve(addresses);
    });
  });
};

module.exports = { checkDomainDNS };
