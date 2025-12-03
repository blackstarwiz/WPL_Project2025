import express, { Router } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";

dotenv.config();

export default function checkoutRouter() {
  const router: Router = express.Router();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  // Checkout pagina
  router.get("/", (req, res) => {
    res.render("checkout", {
      title: "Checkout",
      page: "checkout",
      cart: req.session.cart,
    });
  });

  // Stripe betaling starten
  router.post("/pay", async (req, res) => {
    try {
      const cart = req.session.cart;

      if (!cart || cart.items.length === 0) {
        return res.redirect("/checkout");
      }

      // Line items voor Stripe
      const lineItems = cart.items.map((item: any) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.amount,
      }));

      // 🔥 Metadata meesturen — nog NIET opslaan!
      const metadata: Record<string, string> = {
        cart: JSON.stringify(cart.items),
        totalPrice: String(cart.totalPrice),
        guestId: cart.guestId?.toString() ?? "",
        userId: cart.userId?.toString() ?? "",
      };

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,

        // Succes & cancel
        success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,

        // Alleen als user is ingelogd
        customer_email: req.user?.email ?? undefined,

        // ⭐ SUPER BELANGRIJK — wordt gebruikt in webhook
        metadata,
      });

      res.redirect(session.url!);
    } catch (err) {
      console.error("Stripe fout:", err);
      res.status(500).send("Betaling mislukt.");
    }
  });

  // ⭐ Betaling geslaagd
  router.get("/success", (req, res) => {
    // Winkelmand leegmaken — order is via webhook opgeslagen
    req.session.cart = { items: [], totalPrice: 0 };

    res.render("checkout_success", {
      title: "Betaling gelukt",
    });
  });

  // Betaling geannuleerd
  router.get("/cancel", (req, res) => {
    res.render("checkout_cancel", {
      title: "Betaling geannuleerd",
    });
  });

  return router;
}
