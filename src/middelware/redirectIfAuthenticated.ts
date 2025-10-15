import { Request, Response, NextFunction } from "express";
import { isAuthenticate } from "../database";

export function redirectIfAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (isAuthenticate(req)) {
    return res.redirect("/");
  }
  next();
}
