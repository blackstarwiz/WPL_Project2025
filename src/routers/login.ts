import express, { Router } from "express";

export default function loginRouter() {
  const router: Router = express.Router();
  router.get("/", (req, res) => {
    res.render("login", {
      title: "Pizza Gusto",
      page: "login",
      message: "Please log in",
    });
  });

  return router;
}
