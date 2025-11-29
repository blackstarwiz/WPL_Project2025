import { Router } from "express";
import { secureMiddleware } from "../middelware/secureMiddleware";

const router = Router();

router.get("/pizza-overview", secureMiddleware, (req, res) => {
  res.render("admin_pizza_overview", {
    title: "Pizza overview",
    page: "admin_pizza_overview",
    user: req.user,
  });
});

router.get("/order-overview", secureMiddleware, (req, res) => {
  res.render("admin_order_overview", {
    title: "Order overview",
    page: "admin_order_overview",
    user: req.user,
  });
});

router.get("/user-overview", secureMiddleware, (req, res) => {
  res.render("admin_user_overview", {
    title: "User overview",
    page: "admin_user_overview",
    user: req.user,
  });
});

export default router;
