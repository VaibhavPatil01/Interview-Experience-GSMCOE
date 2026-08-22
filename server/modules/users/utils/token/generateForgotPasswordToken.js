import jwt from 'jsonwebtoken';

// Generates a secure, temporary JWT token used for authenticating password reset requests via email links
const generateForgotPasswordToken = (id, email, isAdmin) => {
  if (!process.env['SECRET_KEY']) {
    console.log('JWT key is undefined');
    throw new Error('JWT SECRET_KEY key not defined');
  }

  const tokenBody = { 
    id,
    email,
    isAdmin,
  };

  // Time the token is valid for (10 minutes)
  const token = jwt.sign(tokenBody, process.env['SECRET_KEY'], {
    expiresIn: '10m',
  });

  if (!token) throw new Error('Could not generate forgot password token');
  return token;
};

export default generateForgotPasswordToken;