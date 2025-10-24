import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function assignGuestId(req: Request, res: Response, next: NextFunction) {
  // Zorg dat er een winkelmand bestaat
  if (!req.session.cart) {
    req.session.cart = { items: [], totalPrice: 0 };
  }

  // Als er geen userId (JWT login) is, gebruik een guestId
  if (!req.session.cart.userId && !req.session.cart.guestId) {
    req.session.cart.guestId = crypto.randomUUID();
    console.log("🆕 Nieuwe gast ID:", req.session.cart.guestId);
  }

  next();
}
