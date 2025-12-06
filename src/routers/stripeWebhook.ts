import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { cartCollection, guestCollection } from "../database";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export function stripeWebhookRouter() {
  const router = express.Router();

  // BELANGRIJK: raw body gebruiken voor Stripe!
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
        console.error("❌ Webhook fout:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;

        console.log("💰 Betaling bevestigd:", session.id);

        const items = JSON.parse(session.metadata.cart);
        const totalPrice = session.amount_total / 100;

        const userId = session.metadata?.userId
          ? new ObjectId(session.metadata.userId)
          : undefined;

        const guestId = session.metadata?.guestId
          ? new ObjectId(session.metadata.guestId)
          : undefined;

        const buyerInfo = userId ? { userId } : guestId ? { guestId } : {};

        // ❗ Bestelling opslaan
        await cartCollection.insertOne({
          ...buyerInfo,
          items,
          totalPrice,
          paymentId: session.id,
          createdAt: new Date(),
        });

        console.log("🛒 Bestelling opgeslagen");

        // Guest email opslaan
        if (guestId && session.customer_email) {
          await guestCollection.updateOne(
            { _id: guestId },
            { $set: { email: session.customer_email } },
            { upsert: true }
          );
        }

        // Guest telefoon opslaan
        if (guestId && session.customer_details?.phone) {
          await guestCollection.updateOne(
            { _id: guestId },
            { $set: { phone: session.customer_details.phone } },
            { upsert: true }
          );
        }
      }

      res.json({ received: true });
    }
  );

  return router;
}
