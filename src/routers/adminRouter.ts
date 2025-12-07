import { Router } from "express";
import { secureMiddleware } from "../middelware/secureMiddleware";
import { cartCollection, userCollection, guestCollection } from "../database";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/pizza-overview", secureMiddleware, (req, res) => {
  res.render("admin_pizza_overview", {
    title: "Pizza overview",
    page: "admin_pizza_overview",
    user: req.user,
  });
});

router.get("/order-overview", secureMiddleware, async (req, res) => {
  try {
    const orders = await cartCollection
      .find({ paymentId: { $exists: true } })
      .sort({ createdAt: -1 })
      .toArray();

    const ordersWithUserInfo = await Promise.all(
      orders.map(async (order) => {
        let userInfo = "Gast";
        let userEmail = "Gast";
        let userName = "Gast";
        let userPhone = "";

        if (order.userId) {
          const user = await userCollection.findOne({ 
            _id: new ObjectId(order.userId) 
          });
          if (user) {
            userInfo = user.email;
            userEmail = user.email;
            userName = user.name || user.email;
            userPhone = user.phone || "";
          }
        } else if (order.guestId) {
          const guest = await guestCollection.findOne({ 
            _id: new ObjectId(order.guestId) 
          });
          if (guest) {
            userInfo = guest.email || `Gast (${order.guestId.toString().slice(-6)})`;
            userEmail = guest.email || "Onbekend";
            userName = "Gast";
            userPhone = guest.phone || "";
          } else {
            userInfo = `Gast (${order.guestId.toString().slice(-6)})`;
          }
        }

        return {
          ...order,
          user: userInfo,
          userEmail: userEmail,
          userName: userName,
          userPhone: userPhone,
          formattedDate: order.createdAt 
            ? new Date(order.createdAt).toLocaleString('nl-NL')
            : 'Onbekende datum',
          formattedTotal: order.totalPrice.toFixed(2)
        };
      })
    );

    res.render("admin_order_overview", {
      title: "Order overview",
      page: "admin_order_overview",
      user: req.user,
      orders: ordersWithUserInfo,
    });
  } catch (error) {
    console.error("Fout bij ophalen bestellingen:", error);
    res.render("admin_order_overview", {
      title: "Order overview",
      page: "admin_order_overview",
      user: req.user,
      orders: [],
      error: "Kon bestellingen niet ophalen",
    });
  }
});

router.get("/user-overview", secureMiddleware, (req, res) => {
  res.render("admin_user_overview", {
    title: "User overview",
    page: "admin_user_overview",
    user: req.user,
  });
});

export default router;
