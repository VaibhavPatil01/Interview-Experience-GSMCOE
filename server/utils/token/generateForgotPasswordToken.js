import jwt from 'jsonwebtoken';

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

  // Time the token is valid for
  const expiryTimeInMilliSecondsSeconds = 10 * 60 * 1000;

  const token = jwt.sign(tokenBody, process.env['SECRET_KEY'], {
    expiresIn: expiryTimeInMilliSecondsSeconds,
  });

  if (!token) throw new Error('Could not generate forgot password token');
  return token;
};

export default generateForgotPasswordToken;