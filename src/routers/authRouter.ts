import express, { Router, Request, Response } from "express";
import { redirectIfAuthenticated } from "../middelware/redirectIfAuthenticated";
import { User } from "../types/interface";
import { createUser, emailCheck, login } from "../database";
import * as jwt from "jsonwebtoken";
import { secureMiddleware } from "../middelware/secureMiddleware";

export default function loginRouter() {
  const router: Router = express.Router();
  router.get(
    "/login",
    redirectIfAuthenticated,
    (req: Request, res: Response) => {
      res.render("login", {
        title: "Login",
        page: "login",
        user: res.locals.user,
      });
    }
  );

  router.post(
    "/login",
    redirectIfAuthenticated,
    async (req: Request, res: Response) => {
      const email: string = req.body.email;
      const password: string = req.body.password;
      try {
        let user: User = await login(email, password);
        delete user.password;
        const token = jwt.sign(user, process.env.JWT_SECRET!, {
          expiresIn: "7d",
        });
        res.cookie("jwt", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: true,
        });

        if (!req.session.cart) {
          req.session.cart = { items: [], totalPrice: 0 };
        }

        if (user._id) {
          req.session.cart.userId = user._id;
          delete req.session.cart.guestId;
        }
        req.session.message = { type: "success", text: "Succesvol ingelogd" };
        res.redirect("/");
      } catch (e: any) {
        req.session.message = { type: "error", text: e.message };
        res.redirect("/login");
      }
    }
  );

  router.post(
    "/logout",
    secureMiddleware,
    async (req: Request, res: Response) => {
      res.clearCookie("jwt");
      if (req.session.cart) {
        delete req.session.cart.userId;
        req.session.cart.guestId = crypto.randomUUID();
      }
      res.redirect("/login");
    }
  );

  router.get(
    "/register",
    redirectIfAuthenticated,
    (req: Request, res: Response) => {
      res.render("register", {
        title: "Registreer",
        page: "register",
        user: res.locals.user,
      });
    }
  );

  router.post(
    "/register",
    redirectIfAuthenticated,
    async (req: Request, res: Response) => {
      const email : string = req.body.email;
      if (await emailCheck(email)) {
        req.session.message = { type: "error", text: "Deze email is reeds gebruikt" };
        res.redirect("/register");
      }
      const name: string = req.body.naam;
      const phone: string = req.body.phoneNumber;
      const password : string = req.body.password;
      await createUser(email, password, phone, name);
      req.session.message = { type: "success", text: "Succesvol geregistreerd" };
      res.redirect("/login");
    }
  );

  return router;
}
