import decodeToken from '../utils/token/decodeToken.js';

const tokenDataParser = (req, res, next) => {
  let token = req.headers['token'];

  if (Array.isArray(token)) {  
    token = token[0];
  }

  if(!req.body){
    req.body = {};
  }

  if (!token) {
    req.body.userId = null;
    return next();
  }

  try {
    // Verify the token
    const authTokenData = decodeToken(token);

    // Adding token data to req
    req.body.userId = authTokenData.id;

    return next();
  } catch (err) {
    req.body.userId = null;
    return next();
  }
};

export default tokenDataParser;