import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

const GENDER_ENUM = ['MALE', 'FEMALE'];
const DENOMINATION_ENUM = ['BAPTIST', 'METHODIST', 'CATHOLIC', 'OTHER', 'PENTECOSTAL', 'NON_DENOMINATIONAL'];
const FAITH_JOURNEY_ENUM = ['NEW_BELIEVER', 'GROWING', 'MATURE', 'ROOTED', 'PASSIONATE'];
const SUNDAY_ACTIVITY_ENUM = ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'OCCASIONALLY', 'RARELY'];
const LOOKING_FOR_ENUM = ['FRIENDSHIP', 'DATING', 'RELATIONSHIP', 'MARRIAGE'];
const HOBBIES_ENUM = ['Reading', 'Music', 'Hiking', 'Cooking', 'Faith', 'Honesty', 'Humor', 'Generosity', 'Gaming'];
const VALUES_ENUM = ['Love', 'Honesty', 'Faith', 'Humor', 'Generosity', 'Loyalty', 'Kindness', 'Patience'];

export interface IUser extends Document {
  _id: Types.ObjectId | string;
  firebaseUid: string;
  email: string;
  password?: string;
  name: string;
  googleId?: string;

  gender?: 'MALE' | 'FEMALE';
  age?: number;
  denomination?: string;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  countryCode?: string;
  birthday?: Date;
  fieldOfStudy?: string;
  profession?: string;
  faithJourney?: string;
  sundayActivity?: string;
  lookingFor?: string[];
  hobbies?: string[];
  values?: string[];
  favoriteVerse?: string;

  profilePhoto1?: string;
  profilePhoto2?: string;
  profilePhoto3?: string;
  profilePhoto4?: string;
  profilePhoto5?: string;
  profilePhoto6?: string;
  profilePhotoCount?: number;

  likes: Types.ObjectId[];
  passes: Types.ObjectId[];
  matches: Types.ObjectId[];
  isVerified: boolean;
  onboardingCompleted: boolean;
  isActive: boolean;

  comparePassword(password: string): Promise<boolean>;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },
    name: { type: String, required: true, trim: true },
    googleId: { type: String },

    gender: { type: String, enum: GENDER_ENUM, required: false },
    age: { type: Number, min: 18, required: false },
    denomination: { type: String, enum: DENOMINATION_ENUM, required: false },
    bio: { type: String, maxlength: 500, trim: true, required: false },
    location: { type: String, trim: true, required: false },
    latitude: { type: Number },
    longitude: { type: Number },

    phoneNumber: { type: String, trim: true },
    countryCode: { type: String, trim: true },
    birthday: { type: Date },

    fieldOfStudy: { type: String, trim: true },
    profession: { type: String, trim: true },

    faithJourney: { type: String, enum: FAITH_JOURNEY_ENUM },
    sundayActivity: { type: String, enum: SUNDAY_ACTIVITY_ENUM },
    lookingFor: { type: [String], enum: LOOKING_FOR_ENUM, required: false },
    hobbies: { type: [String], enum: HOBBIES_ENUM, required: false },
    values: { type: [String], enum: VALUES_ENUM, required: false },
    favoriteVerse: { type: String, maxlength: 100 },

    profilePhoto1: { type: String, default: 'https://default-photo-url/1.jpg' },
    profilePhoto2: { type: String },
    profilePhoto3: { type: String },
    profilePhoto4: { type: String },
    profilePhoto5: { type: String },
    profilePhoto6: { type: String },
    profilePhotoCount: { type: Number, default: 0, min: 0, max: 6 },

    likes: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    passes: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    matches: { type: [{ type: Schema.Types.ObjectId, ref: 'Match' }], default: [] },
    isVerified: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
