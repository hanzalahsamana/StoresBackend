const { exec } = require('child_process');
const { checkDomainDNS } = require('../Helpers/CheckDomainDns');
const { UserModal } = require('../Models/userModal');
const { StoreModal } = require('../Models/StoreModal');
const { checkDomainConfigs, addDomainToVercel, checkVercelDomainStatus } = require('../Services/Vercel.service');
const { isValidDomainConfigs, updateDomainToDatabase } = require('../Utils/DomainUtils');
const WEBSITE_IP_ADDRESS = process.env.WEBSITE_IP_ADDRESS;
const frontendIP = '18.198.243.219';
const privateKeyPath = '/home/ubuntu/saasweb.pem';
const frontendUser = 'ubuntu';

const addCustomDomain = async (req, res) => {
  const { domain } = req.body;
  const { storeId } = req.params;

  try {
    if (!domain || domain.trim() === '') {
      return res.status(400).json({ message: 'Domain is required', code: 'DomainRequired' });
    }

    // Check if the domain is already in use
    const existingDomain = await StoreModal.findOne({ customDomain: domain, isDomainVerified: true });
    const domainConfig = await checkDomainConfigs(domain);
    const isValidDomainConfig = isValidDomainConfigs(domainConfig, domain);

    if (existingDomain && isValidDomainConfig) {
      return res.status(400).json({ message: 'Domain is already in use', code: 'DomainInUse' });
    }

    const response = await addDomainToVercel(domain);
    console.log('Vercel response: 🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺🥺', response);
    let addedDomain = response;

    if (addedDomain?.error && addedDomain?.error?.code === 'invalid_domain') {
      return res.status(400).json({ message: 'Cannot add invalid domain name.', code: 'invalidDomain' });
    }
    if (addedDomain?.error && addedDomain?.error?.code === 'domain_already_exists') {
      if (addedDomain?.error?.projectId === process.env.VERCEL_PROJECT_ID) {
        addedDomain = addedDomain?.domain;
      } else {
        return res.status(400).json({ message: 'Domain is already in use.', code: 'DomainInUse' });
      }
    }

    await updateDomainToDatabase(storeId, domain, false);
    // let ConfigsToResolve = [];

    // if (!addedDomain?.verified && addedDomain?.verification?.length) {
    //   ConfigsToResolve = [...ConfigsToResolve, ...addedDomain?.verification];
    // }
    // const isValidDomainConfig = isValidDomainConfigs(domainConfig, domain);
    // if (isValidDomainConfig?.status === false && isValidDomainConfig?.steps) {
    //   ConfigsToResolve.push(isValidDomainConfig?.steps);
    // }

    // if (ConfigsToResolve.length > 0) {
    //   return res.status(400).json({
    //     message: 'Domain added but not verified. Please configure DNS settings.',
    //     code:'UpdateDNS',
    //     domain,
    //     verified: false,
    //     configs: ConfigsToResolve,
    //   });
    // }

    // await updateDomainToDatabase(storeId, domain, true);
    return res.status(200).json({ message: 'Domain added successfully, but not verified.', domain, verified: false });
  } catch (error) {
    console.error('Error adding custom domain:', error);
    return res.status(500).json({ message: error.message || 'Error adding custom domain', code: 'ServerError' });
  }
};

const checkDomainStatus = async (req, res) => {
  const { storeId } = req.params;
  const { domain } = req.query;

  try {
    if (!domain || domain.trim() === '') {
      return res.status(400).json({ message: 'Domain is required', code: 'DomainRequired' });
    }
    const existingDomain = await StoreModal.findOne({ _id: storeId, customDomain: domain });

    if (!existingDomain) {
      await updateDomainToDatabase(storeId, null, false);
      return res.status(400).json({ message: 'You have not any domain added into your store', code: 'DomainNotFound' });
    }

    // const domainConfig = await checkDomainConfigs(domain);
    const response = await checkVercelDomainStatus(domain);
    let domainStatus = response;

    if (domainStatus?.error && domainStatus?.error?.code === 'not_found') {
      await updateDomainToDatabase(storeId, null, false);
      return res.status(400).json({ message: 'Please first add domain then check status.', code: 'DomainNotFound' });
    }

    const domainConfig = await checkDomainConfigs(domain);

    let ConfigsToResolve = [];

    if (!domainStatus?.verified && domainStatus?.verification?.length) {
      ConfigsToResolve = [...ConfigsToResolve, ...domainStatus?.verification];
    }
    const isValidDomainConfig = isValidDomainConfigs(domainConfig, domain);
    if (isValidDomainConfig?.status === false && isValidDomainConfig?.steps) {
      ConfigsToResolve.push(isValidDomainConfig?.steps);
    }

    if (ConfigsToResolve.length > 0) {
      await updateDomainToDatabase(storeId, domain, false);
      return res.status(400).json({
        message: `Domain is not verified. Please configure DNS settings of ${domain}.`,
        code: 'UpdateDNS',
        domain,
        verified: false,
        configs: ConfigsToResolve,
      });
    }

    await updateDomainToDatabase(storeId, domain, true);
    return res.status(200).json({ message: 'Domain verified successfully', domain, verified: true });
  } catch (error) {
    console.error('Error checking status of domain:', error);
    return res.status(500).json({ message: 'Error checking status of domain', code: 'ServerError' });
  }
};

const deleteCustomDomain = async (req, res) => {
  const { storeId } = req.params;
  console.log(storeId, 'ddd');

  try {
    await updateDomainToDatabase(storeId, null, false);
    return res.status(200).json({ message: 'Domain deleted successfully' });
  } catch (error) {
    console.error('Error occuring while deleting domain:', error);
    return res.status(500).json({ message: 'Error occuring while deleting domain', code: 'ServerError' });
  }
};
module.exports = {
  addCustomDomain,
  checkDomainStatus,
  deleteCustomDomain,
};
