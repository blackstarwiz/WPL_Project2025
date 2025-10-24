import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { User } from "../types/interface";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function secureMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token: string | undefined = req.cookies?.jwt;
  res.locals.user = undefined;

  if (!token) {
    console.log("Geen token gevonden – gebruiker is gast");
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User;
    req.user = decoded;
    res.locals.user = decoded;
    console.log("✅ Ingelogd als:", decoded.email);
  } catch {
    console.log("❌ Token ongeldig of verlopen");
    res.clearCookie("jwt");
  }

  next();
}
