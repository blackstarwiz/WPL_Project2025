import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

export function assignGuestId(req: Request, res: Response, next: NextFunction) {
  if (!req.session.cart) {
    req.session.cart = { items: [], totalPrice: 0 };
  }

  // Als user is ingelogd → gebruik userId
  if (req.user?._id) {
    req.session.cart.userId = req.user._id;
    delete req.session.cart.guestId;
    return next();
  }

  // Alleen gasten krijgen een guestId
  if (!req.session.cart.guestId) {
    req.session.cart.guestId = new ObjectId();
    console.log("🆕 Nieuwe guest ID:", req.session.cart.guestId);
  }

  next();
}


