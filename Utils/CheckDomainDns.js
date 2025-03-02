const dns = require("dns");

const checkDomainDNS = (domain) => {
  return new Promise((resolve, reject) => {
    const resolver = new dns.Resolver();
    resolver.setServers(["8.8.8.8"]);

    resolver.resolve4(domain, (err, addresses) => {
      if (err) {
        console.error(`Error resolving DNS for domain ${domain}:`, err);
        return reject(new Error("Unable to resolve DNS for the domain"));
      }
      resolve(addresses);
      console.log(addresses);
    });
  });
};

module.exports = { checkDomainDNS };
