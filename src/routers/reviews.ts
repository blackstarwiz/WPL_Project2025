import express, { Router } from "express";
import { Review } from "../types/interface";
import { getReviews } from "../database";

export default function reviewsRouter() {
  const router: Router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const reviews: Review[] = await getReviews();
      
      res.render("reviews", {
        title: "Reviews - Pizza Gusto",
        page: "reviews",
        reviews,
        cart: req.session.cart,
      });
    } catch (error) {
      console.error("Fout bij ophalen reviews:", error);
      res.render("reviews", {
        title: "Reviews - Pizza Gusto",
        page: "reviews",
        reviews: [],
        cart: req.session.cart,
      });
    }
  });

  return router;
}