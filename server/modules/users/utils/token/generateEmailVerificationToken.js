import jwt from 'jsonwebtoken';

// Generates a short-lived JWT token used specifically for verifying a user's email address upon registration
const generateEmailVerificationToken = (id, email, isAdmin) => {
  if (!process.env['SECRET_KEY']) {
    console.log('JWT key is undefined');
    throw new Error('JWT SECRET_KEY key not defined');
  }

  const tokenBody = { 
    id,
    email,
    isAdmin,
  };

  const token = jwt.sign(tokenBody, process.env['SECRET_KEY'], { expiresIn: '24h' });

  if (!token) throw new Error('Could not generate email verification token');
  return token;
};

export default generateEmailVerificationToken;