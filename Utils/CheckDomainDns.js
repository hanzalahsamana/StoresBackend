const dns = require("dns");

const isValidDomain = (domain) => {
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};

const checkDomainDNS = (domain) => {
  return new Promise((resolve, reject) => {
    if (!isValidDomain(domain)) {
      return reject(new Error(`Invalid domain format: ${domain}`));
    }

    const resolver = new dns.Resolver();
    resolver.setServers(["8.8.8.8"]);

    resolver.resolve4(domain, (err, addresses) => {
      if (err) {
        if (err.code === "ENODATA" || err.code === "ENOTFOUND") {
          console.warn(`No records found for domain ${domain}`);
          return resolve([]);
        }
        console.error(`Error resolving DNS for domain ${domain}:`, err);
        return reject(err);
      }
      resolve(addresses);
    });
  });
};

module.exports = { checkDomainDNS };
