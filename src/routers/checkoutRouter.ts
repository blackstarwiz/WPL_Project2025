import express, { Router } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

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
      isGuest: !req.user, // voor template: telefoonveld alleen tonen als guest
    });
  });

  // Stripe betaling starten
  router.post("/pay", async (req, res) => {
    try {
      const cart = req.session.cart;
      if (!cart || cart.items.length === 0) return res.redirect("/checkout");

      const lineItems = cart.items.map((item: any) => ({
        price_data: {
          currency: "eur",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.amount,
      }));

      // Metadata sturen naar webhook
      const metadata: Record<string, string> = {
        cart: JSON.stringify(cart.items),
        totalPrice: String(cart.totalPrice),
      };

      if (!req.user && cart.guestId) metadata.guestId = cart.guestId.toString();
      if (req.user?._id) metadata.userId = req.user._id.toString();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,
        success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
        customer_email: req.user?.email ?? undefined, // ingevuld bij ingelogde users
        phone_number_collection: { enabled: !req.user }, // alleen tonen bij guest
        metadata,
      });

      res.redirect(session.url!);
    } catch (err) {
      console.error("Stripe fout:", err);
      res.status(500).send("Betaling mislukt.");
    }
  });

  router.get("/success", (req, res) => {
    req.session.cart = { items: [], totalPrice: 0 };
    res.render("checkout_success", { title: "Betaling gelukt" });
  });

  router.get("/cancel", (req, res) => {
    res.render("checkout_cancel", { title: "Betaling geannuleerd" });
  });

  return router;
}
