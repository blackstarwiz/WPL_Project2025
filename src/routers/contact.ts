import express, { Router } from "express";

export default function contactRouter() {
  const router: Router = express.Router();

  router.get("/", (req, res) => {
    res.render("contact", {
      title: "Pizza Gusto",
      page: "contact",
    });
  });

  return router;
}
