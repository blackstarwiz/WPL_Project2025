import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { cartCollection } from "../database";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export function stripeWebhookRouter() {
  const router = express.Router();

  // Webhook moet raw body gebruiken
  router.post(
    "/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET as string
        );
      } catch (err: any) {
        console.error("Webhook fout:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // ✔ betaling voltooid
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;

        console.log("💰 Betaling bevestigd:", session.id);

        // Items terughalen
        const items = JSON.parse(session.metadata.cart);

        // User of guest ID ophalen
        const userId = session.metadata.userId
          ? new ObjectId(session.metadata.userId)
          : undefined;

        const guestId = session.metadata.guestId
          ? new ObjectId(session.metadata.guestId)
          : undefined;

        const totalPrice = session.amount_total / 100;

        // 🧑‍🤝‍🧑 Fang: user of guest?
        const buyerInfo = userId ? { userId } : { guestId };

        // 🛒 Bestelling opslaan
        await cartCollection.insertOne({
          ...buyerInfo,
          items,
          totalPrice,
          paymentId: session.id,
          createdAt: new Date(),
        });

        console.log("🛍️ Bestelling succesvol opgeslagen in 'cart'");
      }

      res.json({ received: true });
    }
  );

  return router;
}
