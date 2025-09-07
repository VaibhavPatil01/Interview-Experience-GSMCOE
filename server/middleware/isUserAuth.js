import decodeToken from '../utils/token/decodeToken.js';

const isUserAuth = (req, res, next) => {
  let token = req.headers['token'];

  if (Array.isArray(token)) {
    token = token[0]; 
  }

  if (!token) {
    return res.status(401).json({ message: 'User not LoggedIn' });
  }
 
  

  try {
    // Verify the token
    const authTokenData = decodeToken(token);  
    
    // Ensure req.body is an object before attaching
    if (!req.body || typeof req.body !== 'object') {
      req.body = {}; // Force it to an object
    }
    
    // Adding token data to req
    req.body.authTokenData = authTokenData;



    return next();
  } catch (err) {
    return res.status(401).json({ message: 'User not LoggedIn' });
  }
};

export default isUserAuth;