import express, { Router, Request, Response } from "express";
import { redirectIfAuthenticated } from "../middelware/redirectIfAuthenticated";
import { User } from "../types/interface";
import { login } from "../database";
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
        req.session.message = { type: "succes", text: "Succesvol ingelogd" };
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
      res.redirect("/login");
    }
  );

  return router;
}
