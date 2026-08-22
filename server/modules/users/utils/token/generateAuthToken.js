import jwt from 'jsonwebtoken';

// Generates a JWT authentication token used for user sessions and API authorization
const generateAuthToken = (id, email, isAdmin) => {
  if (!process.env['SECRET_KEY']) {
    throw new Error('JWT SECRET_KEY key not defined');
  }

  const tokenBody = {
    id,
    email,
    isAdmin,
  };

  const token = jwt.sign(tokenBody, process.env['SECRET_KEY'], { expiresIn: '30d' });

  if (!token) throw new Error('Could not generate auth token');
  return token;
};

export default generateAuthToken;