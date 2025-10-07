import express, { Router } from "express";
import { bestellingen, menu } from "../database";

export default function bestelRouter() {
  const router: Router = express.Router();

  router.get("/", (req, res) => {
    res.render("bestel", {
      title: "Pizza Gusto",
      page: "bestel",
      menu,
      bestellingen,
    });
  });

  router.post("/", (req, res) => {
    const pizza = req.body.pizza;
    if (pizza) {
      bestellingen.push(pizza);
    }
    res.redirect("/bestel");
  });

  router.post("/verwijder", (req, res) => {
    const idx = parseInt(req.body.index, 10);
    if (!Number.isNaN(idx) && idx >= 0 && idx < bestellingen.length) {
      bestellingen.splice(idx, 1);
    }
    res.redirect("/bestel");
  });

  return router;
}
