import express, { Router } from "express";
import { Pizza } from "../types/interface";
import {
  addPizzaToCartHandler,
  findPizza,
  getPizzas,
  removePizzaFromSessionCart,
  totalAmountCartItems,
  updateAmountInEjs,
  updateCartItemAmount,
} from "../database";

export default function bestelRouter() {
  const router: Router = express.Router();

  router.get("/", async (req, res) => {
    const pizzas: Pizza[] = await getPizzas();
    console.log(req.session.cart?.totalPrice);
    res.render("bestel", {
      title: "Pizza Gusto",
      page: "bestel",
      updateAmountInEjs,
      totalAmountCartItems,
      pizzas,
      cart: req.session.cart,
    });
  });

  router.post("/", async (req, res) => {
    const pizzaName: string = req.body.pizza;
    const pizzaToAdd: Pizza | null = await findPizza(pizzaName);
    if (!pizzaToAdd) {
      req.session.message = { type: "error", text: "Pizza niet gevonden" };
      return res.redirect("/bestel");
    }
    addPizzaToCartHandler(req);
    req.session.message = {
      type: "success",
      text: `${pizzaToAdd.name} toegevoegd aan je winkelmand`,
    };
    res.redirect("/bestel");
  });

  router.post("/verwijder", (req, res) => {
    const item = req.body.item;
    removePizzaFromSessionCart(req, item);
    req.session.message = {
      type: "success",
      text: `${item} verwijderd uit je winkelmand`,
    };
    res.redirect("/bestel");
  });

  router.post("/update", (req, res) => {
    const pizzaName: string = req.body.item;
    const cartItem = updateCartItemAmount(req, pizzaName);

    if (!cartItem) {
      // Als we via fetch werken → JSON fout teruggeven
      if (
        req.xhr ||
        req.headers["x-requested-with"] === "XMLHttpRequest"
      ) {
        return res.status(400).json({
          success: false,
          message: "Item niet gevonden in winkelmand",
        });
      }

      // Gewone fallback -> oude gedrag (redirect)
      req.session.message = {
        type: "error",
        text: "Item niet gevonden in winkelmand",
      };
      return res.redirect("/bestel");
    }

    req.session.message = {
      type: "success",
      text: `${cartItem.name} aangepast naar ${cartItem.amount}`,
    };

    const wantsJson =
      req.xhr ||
      req.headers["x-requested-with"] === "XMLHttpRequest" ||
      (typeof req.headers.accept === "string" &&
        req.headers.accept.includes("application/json"));

    // ✅ Bij AJAX: JSON terugsturen → geen full reload
    if (wantsJson) {
      return res.json({
        success: true,
        item: cartItem,
        message: req.session.message,
        totalPrice: req.session.cart?.totalPrice ?? 0,
        totalItems: totalAmountCartItems(req.session.cart),
      });
    }

    // ✅ Bij gewone form submit blijft het oude gedrag
    res.redirect("/bestel");
  });


  return router;
}
