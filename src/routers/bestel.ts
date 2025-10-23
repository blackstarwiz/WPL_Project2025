import express, { Router } from "express";

export default function bestelRouter() {
  const router: Router = express.Router();

  router.get("/", (req, res) => {
    res.render("bestel", {
      title: "Pizza Gusto",
      page: "bestel",
    });
  });

  router.post("/", (req, res) => {
    res.redirect("/bestel");
  });

  router.post("/verwijder", (req, res) => {
    res.redirect("/bestel");
  });

  return router;
}
