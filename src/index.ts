import express, { Express } from "express";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { setLocals } from "./middelware/locals";
import bestelRouter from "./routers/bestel";
import contactRouter from "./routers/contact";
import loginRouter from "./routers/authRouter";
import livereload, { LiveReloadServer } from "livereload";
import connectLivereload from "connect-livereload";
import cookieParser from "cookie-parser";
import { secureMiddleware } from "./middelware/secureMiddleware";
import { connect } from "./database";
import { flashMiddleware } from "./middelware/flashMiddleware";
import sessionMiddleware from "./session";
import stripe from "./routers/stripe";

const liveReloadServer: LiveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "public"));
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

const app: Express = express();
app.use(connectLivereload());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Voor gecompileerde app in dist/
app.use(express.static(path.join(__dirname, "../public")));
app.set("views", path.join(__dirname, "../views"));
app.use(cookieParser());

app.set("port", process.env.PORT ?? 3000);

// Middleware voor locals
app.use(sessionMiddleware);
app.use(flashMiddleware);
app.use(setLocals);

//Routers
app.use(loginRouter());
app.use("/contact", secureMiddleware, contactRouter());
app.use("/bestel", secureMiddleware, bestelRouter());

app.get("/", secureMiddleware, (req, res) => {
  console.log(res.locals.message);
  res.render("index", {
    title: "Pizza Gusto",
    page: "index",
  });
});

app.get("/stripe-test", async (req, res) => {
  try {
    const products = await stripe.products.list({ limit: 1 });
    res.send(
      `Stripe werkt! Eerste product: ${
        products.data[0]?.name || "geen producten"
      }`
    );
  } catch (err: any) {
    console.error(err);
    res.status(500).send(`Stripe fout: ${err.message}`);
  }
});

app.listen(app.get("port"), async () => {
  try {
    await connect();
    console.log("Server started on http://localhost:" + app.get("port"));
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
});
