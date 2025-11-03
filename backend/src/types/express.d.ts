import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & {
        _id: string; // ✅ Force _id to be a string for controllers
      };
      isAuthenticated(): boolean;
    }
  }
}
