const { exec } = require("child_process");
const { checkDomainDNS } = require("../Helpers/CheckDomainDns");
const { UserModal } = require("../Models/userModal");
const { StoreModal } = require("../Models/StoreModal");
const WEBSITE_IP_ADDRESS = process.env.WEBSITE_IP_ADDRESS;
const frontendIP = "18.198.243.219";
const privateKeyPath = "/home/ubuntu/saasweb.pem";
const frontendUser = "ubuntu";

const isDomainAlreadyInUse = async (storeId, domain) => {
  try {
    const existingStore = await StoreModal.findOne({
      customDomain: domain,
      isDomainVerified: true,
      _id: { $ne: storeId }, // Ensure _id is NOT the given storeId
    });

    return !!existingStore; // Returns true if a verified domain exists with a different storeId, else false
  } catch (error) {
    console.error("Error checking domain:", error);
    return false; // In case of error, return false to avoid breaking logic
  }
};

const updateDomainToDatabase = async (siteName, domain, isDomainVerified) => {
  try {
    const user = await UserModal.findOne({ brandName: String(siteName) });

    if (!user) {
      throw new Error(`No document found with brandName: ${siteName}`);
    }

    user.customDomain = domain; // Update the field
    user.isDomainVerified = isDomainVerified; // Update the field
    await user.save(); // Save the updated document

    return { success: true, message: "Domain updated successfully" };
  } catch (error) {
    console.error("Error updating domain:", error);
    throw error; // Ensure the calling API catches this error
  }
};

const removeDomainFromDatabase = async (req, res) => {
  const siteName = req.collectionType;
  try {
    const user = await UserModal.findOne({ brandName: String(siteName) });

    if (!user) {
      return res.status(404).json({
        message: `No document found with brandName: ${siteName}`,
        StatusCode: "FailedToProcess",
      });
    }

    user.customDomain = null; // Remove the domain
    user.isDomainVerified = false; // Remove the domain
    await user.save(); // Save the update

    console.log(`Domain removed successfully for ${siteName}`);
    return res.status(200).json({
      message: `Domain removed successfully`,
      StatusCode: "success",
    });
  } catch (error) {
    console.error("Error removing domain:", error);
    return res.status(500).json({
      message: "Error occurring while deleting domain.",
      StatusCode: "FailedToProcess",
      error: error.message,
    });
  }
};

const handleDomainRequest = async (req, res) => {
  const { domain } = req.body;
  const type = req.collectionType;
  try {
    if (!domain) {
      return res.status(400).json({
        message: "❌ domain name is required",
        StatusCode: "InvalidDomain",
      });
    }
    if (
      domain.includes("xperiode.com") ||
      (await isDomainAlreadyInUse(type, domain))
    ) {
      return res.status(400).json({
        message: `❌ domain ${domain} is already in use.`,
        StatusCode: "InvalidDomain",
      });
    }
    const dnsRecords = await checkDomainDNS(domain);
    const isDomainLive = dnsRecords.includes(WEBSITE_IP_ADDRESS);

    if (isDomainLive) {
      await updateDomainToDatabase(type, domain, true);
      return res
        .status(200)
        .json({ domain: domain, message: "✅ Your domain is live!" });
    } else if (dnsRecords.length === 0) {
      await updateDomainToDatabase(type, domain, false);
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
      await updateDomainToDatabase(type, domain, false);
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
      message: "❌ Failed to check the domain OR Domain might be Invalid.",
      StatusCode: "FailedToProcess",
      error: error.message,
    });
  }
};

const getStoreByDomain = async (req, res) => {
  try {
    const { domain, subDomain } = req.query;

    if (!domain && !subDomain) {
      return res.status(400).json({ error: "Domain or Subdomain is required" });
    }

    let query = {};

    if (subDomain) {
      query = { subDomain: { $regex: `^${subDomain}$`, $options: "i" } }; // Exact match (case-insensitive)
    } else if (domain) {
      query = { customDomain: { $regex: `^${domain}$`, $options: "i" } }; // Exact match (case-insensitive)
    }

    const store = await StoreModal.findOne(query);

    if (!store) {
      return res.status(404).json({ message: "store not found" });
    }
    res.json({ storeId: store._id });
  } catch (error) {
    console.error("Error fetching site:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
    const command = `ssh -T -o StrictHostKeyChecking=no -i "${privateKeyPath}" ${frontendUser}@${frontendIP} << 'ENDSSH'
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

echo "✅ SSL setup complete for ${userDomain}!"
ENDSSH`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error issuing SSL certificate: ${stderr}`);
        return res.status(500).json({
          message: "❌ SSL setup failed.",
          error: stderr,
        });
      }
      console.log(`🎉 Success: ${stdout} ${stderr}`);
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

module.exports = {
  handleDomainRequest,
  automateDomainSetup,
  getStoreByDomain,
  removeDomainFromDatabase,
};
