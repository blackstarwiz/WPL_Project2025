import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { setLocals } from "./middelware/locals";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(process.cwd(), "public")));
app.set("views", path.resolve(process.cwd(), "views"));

app.set("port", process.env.PORT ?? 3000);

// Middleware voor locals
app.use(setLocals);

app.get("/", (req, res) => {
    res.render("index", {
        title: "Hello World",
        page: 'index',
        message: "Hello World"
    })
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    page: "login",
    message: "Please log in",
  });
});

app.get("/contact", (req, res) => {
    res.render("contact", {
        title: 'Contact',
        page: 'contact'
    })
})

app.listen(app.get("port"), () => {
  console.log("Server started on http://localhost:" + app.get("port"));
});
