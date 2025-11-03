import type { User } from "./User";

export interface Match {
  id: string;
  matchedUser: User; // ✅ Required field
  matchedUserId: string;
  status?: "mutual" | "sent" | "received";
  createdAt?: string;
}
