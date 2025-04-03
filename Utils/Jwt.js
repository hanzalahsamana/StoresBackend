const jwt = require("jsonwebtoken");

const generateJwtToken = async (payload) => {
  const secretKey = process.env.SECRET;
  const oneMonthInSeconds = 30 * 24 * 60 * 60;
  return jwt.sign(payload, secretKey, { expiresIn: oneMonthInSeconds });
};

const verifyJwt = async (token) => {
  const cleanToken = token.replace(/^"|"$/g, ""); // Remove quotes from token
  const secretKey = process.env.SECRET;
  const decoded = jwt.verify(cleanToken, secretKey);
  return decoded;
};

// console.log(verifyJwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2UzZTgwM2NhMGE1MmFkZTg2NDY2MDIiLCJpYXQiOjE3NDI5ODk2NTUsImV4cCI6MTc0NTU4MTY1NX0.R3doU89Zd1tF3qBxnpal532RrCRYvEgbbF7UgHY0vjs"))
module.exports = { generateJwtToken, verifyJwt };
