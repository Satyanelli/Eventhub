import type { JwtPayload } from "jsonwebtoken";

interface AuthUser extends JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};