const { vercel } = require('../config');
const httpClient = require('../Utils/HttpClient');

const addDomainToVercel = async (domain) => {
  try {
    console.log(domain);
    
    const { data } = await httpClient.post(
      `${vercel.baseURL}${vercel.endPoints.addDomain(vercel.projectId)}`,
      { name:domain },
      {
        headers: {
          Authorization: vercel.token,
        },
      }
    );
    return data;
  } catch (error) {
    console.error('Vercel API request failed:', error?.response?.data);
    return error?.response?.data || error?.message;
  }
};
const checkVercelDomainStatus = async (domain) => {
  try {
    const { data } = await httpClient.get(
      `${vercel.baseURL}${vercel.endPoints.checkStatus(vercel.projectId, domain)}`,
      {
        headers: {
          Authorization: vercel.token,
        },
      }
    );
    return data;
  } catch (error) {
    console.error('Vercel API request failed:', error);
    return error?.response?.data || error?.message;
  }
};
const checkDomainConfigs = async (domain) => {
  try {
    const { data } = await httpClient.get(`${vercel.baseURL}${vercel.endPoints.checkConfig(domain)}`, {
      headers: {
        Authorization: vercel.token,
      },
    });
    return data;
  } catch (error) {
    console.error('Vercel API request failed:', error);
    return error?.response?.data || error?.message;
  }
};

module.exports = {
  addDomainToVercel,
  checkVercelDomainStatus,
  checkDomainConfigs,
};
