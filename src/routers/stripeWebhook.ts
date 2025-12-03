import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { cartCollection } from "../database"; 

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export function stripeWebhookRouter() {
  const router = express.Router();

  // Webhook MOET raw body gebruiken
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

      // ✔️ Betaling is bevestigd
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;

        console.log("💰 Stripe betaling bevestigd:", session.id);

        // Cart items die we in metadata hebben gezet
        const items = JSON.parse(session.metadata.cart);

        // Gebruiker ID die we meesturen
        const userIdString = session.metadata.userId;
        const userId = userIdString ? new ObjectId(userIdString) : undefined;

        // Totaalbedrag (Stripe geeft dit in centen)
        const totalPrice = session.amount_total / 100;

        // 🛒 Bestelling opslaan in MongoDB
        await cartCollection.insertOne({
          userId: userId,          // MongoDB ObjectId
          guestId: undefined,      // alleen als je guest checkout gebruikt
          items: items,            // lijst met producten
          totalPrice: totalPrice,  // totaal in euro's
          paymentId: session.id,   // Stripe checkout session ID
          createdAt: new Date(),   // datum en tijd
        });

        console.log("Bestelling opgeslagen in 'cart' collection");
      }

      res.json({ received: true });
    }
  );

  return router;
}
