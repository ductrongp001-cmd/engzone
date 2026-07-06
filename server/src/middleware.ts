import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "engzone_secret_key_change_in_prod";

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as { id: number; email: string; role: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  authenticate(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  });
}
