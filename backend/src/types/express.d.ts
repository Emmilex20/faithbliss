import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & {
        _id: string;
      };
      isAuthenticated(): boolean;
      rawBody?: Buffer;
      userId?: string;
    }
  }
}
