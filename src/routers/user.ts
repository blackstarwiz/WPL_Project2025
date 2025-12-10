import express, { Router } from "express";
import { User } from "../types/interface";
import { getUsers } from "../database";

export default function usersRouter() {
  const router: Router = express.Router();

  // /users/
  router.get("/", async (req, res) => {
    try {
      const users: User[] = await getUsers();

      res.render("users", {
        title: "Gebruikers",
        page: "users",
        users,
        cart: req.session.cart,
      });
    } catch (error) {
      console.error("Fout bij ophalen users:", error);
      res.render("users", {
        title: "Gebruikers",
        page: "users",
        users: [],
        cart: req.session.cart,
      });
    }
  });

  return router;
}
