import { randomUUID } from 'crypto';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createUser, findUser } from '../services/userService.js';

const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'];
const SERVER_BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:5000";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.log('Google Auth Credential not Found in ENV!!'); 
  process.exit(1); 
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${SERVER_BASE_URL}/user/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails) {
          return done(null, false, { message: 'Email not found in Google profile' });
        }

        const userEmail = profile.emails[0].value; 
        const user = await findUser(userEmail); 

        // If user is already present
        if (user) {
          return done(null, user);
        }

        // Create user if not present
        const newUser = await createUser({
          username: profile.displayName,
          email: userEmail,
          password: randomUUID(),
          isAdmin: false,
          isEmailVerified: true,
          branch: 'NA',
          passingYear: 'NA',
          designation: 'NA',
          about: 'Hey there! Just joined the platform.',
          github: null,
          linkedin: null,
        });

        return done(null, newUser);
      } catch (error) {
        console.log(error);
        return done('Error while login');
      }
    },
  ),
);

export default passport;