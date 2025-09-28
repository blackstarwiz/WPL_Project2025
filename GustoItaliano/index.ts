import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // serve static files from /public


// Data, als je items toevoegd zal deze te voorschijn komen in de live view
type MenuItem = { naam: string; foto: string };
let menu: MenuItem[] = [
  { naam: "Diavola", foto: "/images/diavola.jpg" }
];
let bestellingen: string[] = [];

// Routes
app.get("/", (req, res) => {
  res.render("bestel_pagina", { menu, bestellingen });
});

app.post("/bestel", (req, res) => {
  const pizza = req.body.pizza;
  if (pizza) {
    bestellingen.push(pizza);
  }
  res.redirect("/");
});

app.post("/bestel/verwijder", (req, res) => {
  const idx = parseInt(req.body.index, 10);
  if (!Number.isNaN(idx) && idx >= 0 && idx < bestellingen.length) {
    bestellingen.splice(idx, 1);
  }
  res.redirect("/");
});

app.set("port", process.env.PORT ?? 3000);

app.listen(app.get("port"), () => {
  console.log("Server started on http://localhost:" + app.get("port"));
});