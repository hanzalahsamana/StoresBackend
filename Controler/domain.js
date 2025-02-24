const { exec } = require("child_process");
const dns = require("dns");
const WEBSITE_IP_ADDRESS = process.env.WEBSITE_IP_ADDRESS;
const serverIP = "13.51.93.22";
const frontendIP = "13.61.204.32";
const privateKeyPath = "/home/ubuntu/saasweb.pem";
const frontendUser = "ubuntu";

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

const handleDomainRequest = async (req, res) => {
  const { domain } = req.body;

  try {
    const dnsRecords = await checkDomainDNS(domain);
    const isDomainLive = dnsRecords.includes(WEBSITE_IP_ADDRESS);

    if (isDomainLive) {
      return res.status(200).json({ message: "✅ Your domain is live!" });
    } else if (dnsRecords.length === 0) {
      return res.status(400).json({
        message: "❌ Your domain has no valid A record.",
        StatusCode: "UpdateDNS",
        instructions: {
          type: "A",
          name: "@",
          pointsTo: WEBSITE_IP_ADDRESS,
          TTL: "14400",
        },
      });
    } else {
      return res.status(400).json({
        message: "❌ Your domain is pointing to the wrong IP.",
        current_ip: dnsRecords,
        StatusCode: "UpdateDNS",
        instructions: {
          type: "A",
          name: "@",
          pointsTo: WEBSITE_IP_ADDRESS,
          TTL: "14400",
        },
      });
    }
  } catch (error) {
    console.error("Error handling domain request:", error);
    if (error.code === "ENOTFOUND") {
      return res.status(400).json({
        message: "❌ Invalid domain. The domain does not exist.",
        StatusCode: "InvalidDomain",
      });
    }

    return res.status(500).json({
      message: "❌ Failed to check the domain. Please try again later.",
      StatusCode: "FailedToProcess",
      error: error.message,
    });
  }
};

const automateDomainSetup = async (req, res) => {
  const { userDomain } = req.body;

  if (!userDomain || !frontendIP || !privateKeyPath) {
    return res.status(400).json({
      message: "❌ Missing required parameters.",
      requiredFields: ["userDomain", "frontendIP", "privateKeyPath"],
    });
  }

  try {
    console.log(`Verifying domain: ${userDomain}...`);

    // Check DNS records for domain
    const { address } = await dns.lookup(userDomain);
    if (address !== frontendIP) {
      return res.status(400).json({
        message: `❌ Domain verification failed. ${userDomain} is not pointing to ${frontendIP}.`,
        currentIP: address,
        requiredIP: frontendIP,
      });
    }

    console.log(
      `✅ Domain ${userDomain} is verified! Proceeding with SSL setup...`
    );

    // SSH command for SSL setup
    const command = `
      ssh -T -o StrictHostKeyChecking=no -i "${privateKeyPath}" ${frontendUser}@${frontendIP} << 'ENDSSH'
        echo "🔹 Connected to frontend server..."
        
        # Install Certbot if not installed
        sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx
        
        # Issue SSL Certificate
        sudo certbot certonly --nginx -d ${userDomain} --non-interactive --agree-tos --email youremail@example.com
        
        # Configure Nginx
        sudo bash -c 'cat <<EOF_NGINX > /etc/nginx/sites-available/${userDomain}
server {
    listen 443 ssl;
    server_name ${userDomain};

    ssl_certificate /etc/letsencrypt/live/${userDomain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${userDomain}/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;

        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \\$http_upgrade;
    }
}
EOF_NGINX'
        
        # Enable site & reload Nginx
        sudo ln -sf /etc/nginx/sites-available/${userDomain} /etc/nginx/sites-enabled/
        
        # Test Nginx config
        sudo nginx -t
        
        # Restart Nginx
        sudo systemctl restart nginx
      
        echo "✅ SSL setup complete for ${userDomain}!"ENDSSH`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error issuing SSL certificate: ${stderr}`);
        return res.status(500).json({
          message: "❌ SSL setup failed.",
          error: stderr,
        });
      }
      console.log(`🎉 Success: ${stdout}`);
      return res.status(200).json({
        message: `✅ SSL setup complete for ${userDomain}!`,
        output: stdout,
      });
    });

  } catch (error) {
    console.error("❌ Error processing request:", error);
    return res.status(500).json({
      message: "❌ An error occurred during domain verification or SSL setup.",
      error: error.message,
    });
  }
};

module.exports = { handleDomainRequest, automateDomainSetup };
