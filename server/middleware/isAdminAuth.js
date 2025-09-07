import decodeToken from '../utils/token/decodeToken.js'

const isAdminAuth = (req, res, next) => {
  let token = req.headers['token']; 

  if (Array.isArray(token)) {
    token = token[0];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not LoggedIn as Admin' });
  }

  // Verify the token
  try {
    const authTokenData = decodeToken(token);

    // Check if data exists and user is admin
    if (!authTokenData.isAdmin) {
      return res.status(401).json({ message: 'Not LoggedIn as Admin' });
    }

    // Adding token data to req
    req.body.authTokenData = authTokenData;

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Not LoggedIn as Admin' });
  }
};

module.exports = isAdminAuth;