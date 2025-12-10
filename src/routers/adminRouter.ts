import express, { Router } from "express";
import { title } from "process";
import { cartCollection, userCollection, guestCollection } from "../database";
import { ObjectId } from "mongodb";

const router = Router();

export default function adminRouter() {
  const router: Router = express.Router();

  router.get("/", async (req, res, next) => {
    try {
      const users = await userCollection.find().toArray();
      res.render("adminPage", {
        title: "Admin Page (Overview)",
        page: "admin",
        user: (req as any).user || null,
        users
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/pizza-overview", async (req, res, next) => {
    try {
      const users = await userCollection.find().toArray();
      const geusts = await guestCollection.find().toArray();
      const carts = await cartCollection.find().toArray();
      
      res.render("admin_pizza_overview", {
        title: "Admin Page (Pizza)",
        page: "pizza-overview",
        user: (req as any).user || null,
        users,
        geusts,
        carts
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
