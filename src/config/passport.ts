import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel, { UserData } from '../models/UserModel';

const userModel = UserModel.getInstance();

// Serialize user for session
passport.serializeUser((user: any, done) => {
  console.log('🔐 Serializing user:', user.id, user.username || user.email);
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    console.log('🔐 Deserializing user ID:', id);
    const user = await userModel.findById(id);
    console.log('🔐 Deserialized user:', user ? (user.username || user.email) : 'Not found');
    done(null, user);
  } catch (error) {
    console.error('❌ Error deserializing user:', error);
    done(error, null);
  }
});

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username: string, password: string, done) => {
    try {
      const user = await userModel.validatePassword(username, password);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Usuario o contraseña incorrectos' });
      }
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://p2-31031669-4-8zow.onrender.com/callback'
    },
    async (accessToken: string, refreshToken: string, profile: any, done) => {
      try {
        console.log('🔍 Google OAuth callback initiated');
        console.log('📧 Profile email:', profile.emails?.[0]?.value);
        console.log('🆔 Google ID:', profile.id);
        
        // Check if user already exists with this Google ID
        let user = await userModel.findByGoogleId(profile.id);
        
        if (user) {
          console.log('✅ Existing Google user found:', user.username);
          return done(null, user);
        }
        
        // Check if user exists with the same email
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await userModel.findByUsername(email);
          if (user) {
            console.log('✅ Existing user found by email, linking Google account');
            // Link Google account to existing user
            await userModel.linkGoogleAccount(user.id!, profile.id);
            const updatedUser = await userModel.findById(user.id!);
            return done(null, updatedUser as any);
          }
        }
        
        console.log('🆕 Creating new Google user as admin');
        // Create new user - Google users are automatically admins
        const username = email || `google_admin_${profile.id}`;
        const newUserId = await userModel.createUser({
          username: username,
          password: '', // No password for OAuth users
          google_id: profile.id,
          email: email
        });
        
        const newUser = await userModel.findById(newUserId);
        console.log('✅ New Google admin user created:', newUser?.username);
        return done(null, newUser as any);
      } catch (error) {
        console.error('❌ Google OAuth error:', error);
        return done(error as any, false);
      }
    }
  ));
}

export default passport;
