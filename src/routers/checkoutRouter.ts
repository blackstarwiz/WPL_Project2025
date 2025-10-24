import express, { Router } from "express";
import { title } from "process";

export default function checkoutRouter() {
  const router: Router = express.Router();

  router.get("/", (req, res) => {
    res.render("checkout", {
      title: "Checkout",
      cart: req.session.cart,
    });
  });

  return router;
}
