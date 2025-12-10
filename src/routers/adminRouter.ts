import { Router } from "express";
import { secureMiddleware } from "../middelware/secureMiddleware";

const router = Router();

// enkel admins kunnen in het admin panel zien
router.use(secureMiddleware, (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    req.session.message = {
      type: "error",
      text: "Toegang geweigerd - admin only",
    };
    return res.redirect("/");
  }
  next();
});

router.get("/pizza-overview", (req, res) => {
  res.render("admin_pizza_overview", {
    title: "Pizza overview",
    page: "admin_pizza_overview",
    user: req.user,
  });
});

router.get("/order-overview", (req, res) => {
  res.render("admin_order_overview", {
    title: "Order overview",
    page: "admin_order_overview",
    user: req.user,
  });
});

router.get("/user-overview", (req, res) => {
  res.render("admin_user_overview", {
    title: "User overview",
    page: "admin_user_overview",
    user: req.user,
  });
});

export default function adminRouter() {
  return router;
}
