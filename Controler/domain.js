// const { Route53Client, ChangeResourceRecordSetsCommand } = require('@aws-sdk/client-route-53');
// const axios = require("axios");

// const route53 = new Route53Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });
// const addDomain = async (req, res) => {
//   const { domain } = req.body;

//   const params = {
//     HostedZoneId: process.env.AWS_HOSTED_ZONE_ID,
//     ChangeBatch: {
//       Changes: [
//         {
//           Action: "UPSERT",
//           ResourceRecordSet: {
//             Name: domain,
//             Type: "A",
//             TTL: 300,
//             ResourceRecords: [
//               {
//                 Value: process.env.WEBSITE_IP_ADDRESS,
//               },
//             ],
//           },
//         },
//       ],
//     },
//   };

//   try {

//     const data = await route53.send(new ChangeResourceRecordSetsCommand(params));
//     console.log("DNS record added in Route 53:", data , req.body);

//     const cloudflareResponse = await axios.post(
//       `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`,
//       {
//         type: "A",
//         name: domain,
//         content: process.env.WEBSITE_IP_ADDRESS,
//         ttl: 300,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (cloudflareResponse.data.success) {
//       return res.status(200).json({
//         message: "Domain added successfully to Route 53 and Cloudflare",
//       });
//     } else {
//       throw new Error("Failed to add domain to Cloudflare");
//     }
//   } catch (error) {
//     console.error("Error adding domain:", error);
//     res.status(500).json({
//       message: "Failed to add domain",
//       error: error.message,
//     });
//   }
// };

// const verifyDomain = async (req, res) => {
//   const { domain } = req.query;

//   try {

//     const dnsResponse = await axios.get(
//       `https://dns.google/resolve?name=${domain}&type=A`
//     );

//     if (dnsResponse.data && dnsResponse.data.Answer) {
//       return res.status(200).json({
//         message: "Domain DNS records are live",
//         dnsRecords: dnsResponse.data.Answer,
//       });
//     } else {
//       return res
//         .status(400)
//         .json({ message: "DNS records not found or not propagated" });
//     }
//   } catch (error) {
//     console.error("Error verifying domain:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to verify domain", error: error.message });
//   }
// };

// module.exports = { addDomain, verifyDomain };
// const {
//   Route53Client,
//   ChangeResourceRecordSetsCommand,
// } = require("@aws-sdk/client-route-53");

// const addDNSRecordToRoute53 = async (domain) => {
//   if (!AWS_HOSTED_ZONE_ID) {
//     console.error("AWS_HOSTED_ZONE_ID is missing. Cannot add record.");
//     return;
//   }

//   const route53 = new Route53Client({ region: "us-east-1" });

//   const params = {
//     HostedZoneId: AWS_HOSTED_ZONE_ID,
//     ChangeBatch: {
//       Changes: [
//         {
//           Action: "UPSERT",
//           ResourceRecordSet: {
//             Name: domain,
//             Type: "A",
//             TTL: 300,
//             ResourceRecords: [{ Value: WEBSITE_IP_ADDRESS }],
//           },
//         },
//       ],
//     },
//   };

//   try {
//     await route53.send(new ChangeResourceRecordSetsCommand(params));
//     console.log(`DNS record added to Route 53 for ${domain}`);
//   } catch (error) {
//     console.error("Error adding DNS record to Route 53:", error);
//   }
// };
// const AWS_HOSTED_ZONE_ID = process.env.AWS_HOSTED_ZONE_ID; // Corrected Route 53 Hosted Zone ID

const WEBSITE_IP_ADDRESS = process.env.WEBSITE_IP_ADDRESS;

const checkDomainDNS = (domain) => {
  return new Promise((resolve, reject) => {
    const resolver = new dns.Resolver();
    resolver.setServers(["8.8.8.8"]); // Use Google's DNS server

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

const handleDomainRequest = async (req, res) => {
  const { domain } = req.body;

  try {
    console.log(`Checking DNS records for domain: ${domain}`);
    const dnsRecords = await checkDomainDNS(domain);
    const isDomainLive = dnsRecords.includes(WEBSITE_IP_ADDRESS);

    if (isDomainLive) {
      return res.status(200).json({ message: "✅ Your domain is live!" });
    } else if (dnsRecords.length === 0) {
      return res.status(400).json({
        message: "⚠️ Your domain has no valid A record.",
        instructions: `Please add an A record for ${domain} pointing to ${WEBSITE_IP_ADDRESS}.`,
      });
    } else {
      return res.status(400).json({
        message: "❌ Your domain is pointing to the wrong IP.",
        current_ip: dnsRecords,
        instructions: `Update your A record to point to ${WEBSITE_IP_ADDRESS}.`,
      });
    }
  } catch (error) {
    console.error("Error handling domain request:", error);
    res.status(500).json({
      message: "❌ Failed to process domain.",
      error: error.message,
    });
  }
};

const generateSSLForDomain = (domain) => {
  return new Promise((resolve, reject) => {
    exec(
      `ssh -i "/home/ubuntu/saasweb.pem" ubuntu@ec2-13-61-204-32.eu-north-1.compute.amazonaws.com 'sudo certbot --nginx -d ${domain} --agree-tos --non-interactive --email hanzalahsamana789@gmail.com'`,
      (error, stdout, stderr) => {
        if (error) {
          reject(`Error generating SSL for ${domain}: ${stderr}`);
        } else {
          resolve(`SSL certificate generated successfully for ${domain}`);
        }
      }
    );
  });
};

const addSSl = async (req, res) => {
  const { domain } = req.body;
  try {
    console.log("hello world");

    const message = await generateSSLForDomain(domain);
    console.log("hello world");
    res.send({ message });
  } catch (err) {
    console.log("hello world");
    res.status(500).send({ message: err });
  }
};

const { exec } = require("child_process");
const dns = require("dns");
const fs = require("fs");


function automateDomainSetup(userDomain, serverIP, frontendIP, privateKeyPath, frontendUser = "ubuntu") {
  console.log(`Verifying domain: ${userDomain}...`);

  // Step 1: Verify if the domain points to the correct IP
  dns.lookup(userDomain, (err, address) => {
    if (err || address !== frontendIP) {
      console.error(`❌ Domain verification failed: ${userDomain} is not pointing to ${frontendIP}`);
      return;
    }
       // # Install Certbot if not installed
        // sudo apt update && sudo apt install -y certbot python3-certbot-nginx
    console.log(`✅ Domain ${userDomain} is verified! Proceeding with SSL setup...`);

    // Step 2: Run SSL setup on the frontend server via SSH
    const command = `
      ssh -i "${privateKeyPath}" ${frontendUser}@${frontendIP} << 'EOF'
        echo "🔹 Connected to frontend server..."

 
        
        # Issue SSL Certificate
        sudo certbot certonly --nginx -d ${userDomain} --non-interactive --agree-tos --email youremail@example.com
        
        # Configure Nginx
        sudo bash -c 'cat > /etc/nginx/sites-available/${userDomain}' << EOL
        server {
          server_name ${userDomain};
          
          location / {
            proxy_pass http://localhost:3000;  # Your app's backend
          }
          
          listen 443 ssl;
          ssl_certificate /etc/letsencrypt/live/${userDomain}/fullchain.pem;
          ssl_certificate_key /etc/letsencrypt/live/${userDomain}/privkey.pem;
        }
        EOL
        
        # Enable site & reload Nginx
        sudo ln -sf /etc/nginx/sites-available/${userDomain} /etc/nginx/sites-enabled/
        sudo systemctl reload nginx

        echo "✅ SSL setup complete for ${userDomain}!"
      EOF
    `;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error issuing SSL certificate: ${stderr}`);
        return;
      }
      console.log(`🎉 Success: ${stdout}`);
    });
  });
}

// Example Usage
automateDomainSetup(
  "hannanfabrics.com",              // Your domain
  "13.51.93.22",                    // Server IP (should match DNS)
  "13.61.204.32",                   // Frontend Server Public IP
  "/home/ubuntu/saasweb.pem"         // Path to SSH private key
);

// Call the function with user-provided domain and server IP
// automateDomainSetup("xperiode.com", "13.51.93.22");

module.exports = { handleDomainRequest, addSSl };
