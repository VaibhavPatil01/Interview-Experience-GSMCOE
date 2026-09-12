import { randomUUID } from 'crypto';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { createUser, findUser } from '../modules/users/services/userService.js';

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
          about: 'Hey there! Just joined the platform.',
          github: null,
          linkedin: null,
        });

        return done(null, newUser);
      } catch (error) {
        console.log(error);
        return done('Error while login');
      }
    }
  )
);

const GITHUB_CLIENT_ID = process.env['GITHUB_CLIENT_ID'];
const GITHUB_CLIENT_SECRET = process.env['GITHUB_CLIENT_SECRET'];

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.log('GitHub Auth Credential not Found in ENV!!'); 
} else {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: `${SERVER_BASE_URL}/user/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userEmail = profile.emails && profile.emails.length > 0 
            ? profile.emails[0].value 
            : `${profile.username}@github-oauth.com`;

          const user = await findUser(userEmail); 

          if (user) {
            return done(null, user);
          }

          const newUser = await createUser({
            username: profile.displayName || profile.username,
            email: userEmail,
            password: randomUUID(),
            isAdmin: false,
            isEmailVerified: true,
            about: 'Hey there! Just joined the platform via GitHub.',
            github: profile.profileUrl,
            linkedin: null,
          });

          return done(null, newUser);
        } catch (error) {
          console.log(error);
          return done('Error while GitHub login');
        }
      }
    )
  );
}

export default passport;