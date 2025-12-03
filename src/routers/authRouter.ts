import express, { Router, Request, Response } from "express";
import { redirectIfAuthenticated } from "../middelware/redirectIfAuthenticated";
import { User } from "../types/interface";
import { createUser, emailCheck, login, passwCheck } from "../database";
import * as jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

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

router.post("/logout", (req, res) => {
  res.clearCookie("jwt");

  // Maak een NIEUWE lege cart voor een gast
  req.session.cart = {
    items: [],
    totalPrice: 0,
    guestId: new ObjectId(),
  };

  console.log("🔁 Nieuwe guest na logout:", req.session.cart.guestId);

  res.redirect("/login");
});


  router.get(
    "/register",
    redirectIfAuthenticated,
    (req: Request, res: Response) => {
      const oldFormData = req.session.formData || {};
      delete req.session.formData;

      res.render("register", {
        title: "Registreer",
        page: "register",
        user: res.locals.user,
        formData: oldFormData
      });
    }
  );

  router.post(
    "/register",
    redirectIfAuthenticated,
    async (req: Request, res: Response) => {
      const email : string = req.body.email;
      const name: string = req.body.name;
      const phone: string = req.body.phoneNumber;
      const password : string = req.body.password;
      const passConfirm : string = req.body.passwordConfirmation;

      req.session.formData = {email, name, phone};
      if (await emailCheck(email)) {
        req.session.message = { type: "error", text: "Deze email is al in gebruik" };
        return res.redirect("/register");
      }
      if (passwCheck(password, passConfirm)) {
        req.session.message = { type: "error", text: "Het wachtwoord en de bevestiging komen niet overeen" };
        return res.redirect("/register");
      }
      await createUser(email, password, phone, name);
      req.session.message = { type: "success", text: "Succesvol geregistreerd" };

      delete req.session.formData;
      return res.redirect("/login");
    }
  );

  return router;
}
