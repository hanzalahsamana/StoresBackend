require('dotenv').config();

module.exports = {
  vercel: {
    baseURL: 'https://api.vercel.com',
    token: process.env.VERCEL_API_TOKEN,
    projectId: process.env.ADMIN_PANEL_PROJECT_ID_ON_VERCEL,
    endPoints: {
      addDomain: (projectId) => `/v9/projects/${projectId}/domains`,
      removeDomain: (id) => `/v1/domains/${id}`,
      getDomain: (id) => `/v1/domains/${id}`,
      checkStatus: (projectId , domain) => `/v9/projects/${projectId}/domains/${domain}`,
      checkConfig: (domain) => `/v6/domains/${domain}/config`,
    },
  },
};
