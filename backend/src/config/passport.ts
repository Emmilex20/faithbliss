// src/config/passport.ts

import passport, { DoneCallback } from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  StrategyOptionsWithRequest,
  VerifyCallback,
} from "passport-google-oauth20";
import { Request } from "express";
import User, { IUser } from "../models/User"; 
import { Types } from "mongoose";

// ----------------------------------------------------------------------
// ENVIRONMENT CHECK (Omitted for brevity, assume it's correct)
// ----------------------------------------------------------------------
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !CALLBACK_URL) {
  throw new Error("Google OAuth environment variables must be defined.");
}

// ----------------------------------------------------------------------
// PASSPORT SERIALIZATION
// ----------------------------------------------------------------------

(passport as unknown as passport.Authenticator<IUser>).serializeUser((user, done: DoneCallback) => {
  done(null, (user as IUser).id); 
});

(passport as unknown as passport.Authenticator<IUser>).deserializeUser(async (id: string, done: DoneCallback) => {
  try {
    const user = await User.findById(id); 
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ----------------------------------------------------------------------
// GOOGLE STRATEGY CONFIGURATION
// ----------------------------------------------------------------------
const strategyOptions: StrategyOptionsWithRequest = {
  clientID: GOOGLE_CLIENT_ID!,
  clientSecret: GOOGLE_CLIENT_SECRET!,
  callbackURL: CALLBACK_URL!,
  passReqToCallback: true,
};

// Strongly typed verify callback
const googleVerifyCallback = async (
  req: Request,
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifyCallback
): Promise<void> => {
  const email = profile.emails?.[0].value;
  const googleId = profile.id;

  if (!email) {
    return done(new Error("Google profile did not provide an email address."), false);
  }

  try {
    // 1. Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [{ googleId: googleId }, { email: email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      return done(null, user);
    }

    // 2. Create New User
    const newUser: Partial<IUser> = {
      googleId: googleId,
      // 🔑 CRITICAL FIX APPLIED HERE: Use Google ID to satisfy Mongoose's required 'firebaseUid'
      firebaseUid: googleId, 
      email: email,
      name: profile.displayName || profile.name?.givenName || 'New User',
      profilePhoto1: profile.photos?.[0]?.value,
      onboardingCompleted: false, 
      isVerified: true, 
      password: undefined, 
    };

    user = await User.create(newUser);
    return done(null, user);
  } catch (err) {
    console.error("Error during Google OAuth:", err);
    return done(err as Error, false); 
  }
};

// ----------------------------------------------------------------------
// REGISTER STRATEGY
// ----------------------------------------------------------------------
passport.use(new GoogleStrategy(strategyOptions, googleVerifyCallback));

export default passport;