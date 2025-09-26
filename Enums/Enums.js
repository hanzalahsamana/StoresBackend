const Vercel_Recommended_Nameservers = ['ns1.vercel-dns.com', 'ns2.vercel-dns.com', 'ns3.vercel-dns.com', 'ns4.vercel-dns.com'];
const Vercel_IP = process.env.VERCEL_IP_ADDRESS;
const Vercel_Cname = process.env.VERCEL_CNAME;

const Allowed_Themes = ['Light', 'Modern Dark', 'Milt Blue', 'Soft Breeze'];

module.exports = {
  Vercel_Recommended_Nameservers,
  Vercel_IP,
  Vercel_Cname,
  Allowed_Themes,
};
