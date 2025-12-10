import { Router } from "express";
import { cartCollection, userCollection, guestCollection, pizzaCollection, findPizza } from "../database";
import { ObjectId } from "mongodb";
import { authorizeRole } from "../middelware/authorizeRole";


const router = Router();

//Overzicht blanco formulieren
router.get("/pizza-overview", async (req, res) => {
  try {
    const docs = await pizzaCollection
      .find({}, { projection: { name: 1, _id: 0 } })
      .toArray();

    const pizzas = docs.map(d => d.name);

    res.render("admin_pizza_overview", {
      title: "Pizza Overzicht",
      page: "admin_pizza_overview",
      user: req.user,
      pizzas,
      pizza: undefined
    });
  } catch (err) {
    console.log(err);
    res.send("Er ging iets mis.");
  }
});

//Post edit pagina
router.post("/pizza-overview/edit", async (req, res) => {
  const chosenName = req.body.pizzaName;
  if (!chosenName) return res.redirect("/admin/pizza-overview");
  res.redirect(`/admin/pizza-overview/edit/${chosenName}`);
});


//Get edit pagina
router.get(
  "/pizza-overview/edit/:name",
  async (req, res) => {
    const pizzaName = req.params.name;
    const pizza = await findPizza(pizzaName);

    const docs = await pizzaCollection
      .find({}, { projection: { name: 1, _id: 0 } })
      .toArray();
    const pizzas = docs.map(d => d.name);

    res.render("admin_pizza_overview", {
      title: "Pizza bewerken",
      page: "admin_pizza_overview",
      user: req.user,
      pizzas,
      pizza
    });
  }
);

//Post add pagina
router.post("/pizza-overview/add", async (req, res) => {
  try {
    const { name, price, imageUrl, ingredients } = req.body;

    const priceNum = Number(price);
    if (isNaN(priceNum)) return res.send("Prijs moet een nummer zijn.");

    const ingredientsArray = ingredients
  ? ingredients.split(",").map((i: string) => i.trim()).filter((i: string) => i.length > 0)
  : [];


    await pizzaCollection.insertOne({
      name,
      price: priceNum,
      image: imageUrl || null,
      ingredients: ingredientsArray
    });

    res.redirect("/admin/pizza-overview");
  } catch (err) {
    console.log(err);
    res.send("Toevoegen mislukt.");
  }
});

//Post save pizza
router.post("/pizza-overview/save", async (req, res) => {
  try {
    const { oldName, newName, price, imageUrl, ingredients } = req.body;

    const priceNum = Number(price);
    if (isNaN(priceNum)) return res.send("Prijs moet een nummer zijn.");

    const ingredientsArray = ingredients
  ? ingredients.split(",").map((i: string) => i.trim()).filter((i: string) => i.length > 0)
  : [];

    await pizzaCollection.updateOne(
      { name: oldName },
      {
        $set: {
          name: newName || oldName,
          price: priceNum,
          image: imageUrl || null,
          ingredients: ingredientsArray
        }
      }
    );

    res.redirect("/admin/pizza-overview");
  } catch (err) {
    console.log(err);
    res.send("Bewerken mislukt.");
  }
});

//Post Pizza verwijderen
router.post("/pizza-overview/delete", async (req, res) => {
  try {
    const { pizzaName } = req.body;

    if (!pizzaName) {
      return res.redirect("/admin/pizza-overview");
    }

    await pizzaCollection.deleteOne({ name: pizzaName });

    res.redirect("/admin/pizza-overview");
  } catch (err) {
    console.error(err);
    res.send("Verwijderen mislukt");
  }
});


router.get("/order-overview", async (req, res) => {
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


router.get("/user-overview", async (req, res) => {
  try {
    // Of via getUsers(), zie hieronder
    const users = await userCollection
      .find({}, { projection: { password: 0 } }) 
      .toArray();

    res.render("admin_user_overview", {
      title: "User overview",
      page: "admin_user_overview",
      user: req.user,          
      users,                   
      cart: req.session.cart,
    });
  } catch (error) {
    console.error("Fout bij ophalen users:", error);
    res.render("admin_user_overview", {
      title: "User overview",
      page: "admin_user_overview",
      user: req.user,
      users: [],               
      cart: req.session.cart,
      errorMessage: "Er ging iets fout bij het ophalen van de gebruikers.",
    });
  }
});
export default router;

