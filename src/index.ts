import express, { Express } from "express";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { setLocals } from "./middelware/locals";
import reviewsRouter from "./routers/reviews";
import bestelRouter from "./routers/bestel";
import contactRouter from "./routers/contact";
import loginRouter from "./routers/authRouter";
import livereload, { LiveReloadServer } from "livereload";
import connectLivereload from "connect-livereload";
import cookieParser from "cookie-parser";
import { secureMiddleware } from "./middelware/secureMiddleware";
import { connect, getReviews } from "./database";
import { flashMiddleware } from "./middelware/flashMiddleware";
import sessionMiddleware from "./session";
import { assignGuestId } from "./middelware/assignGuestId";
import checkoutRouter from "./routers/checkoutRouter";
import adminRouter from "./routers/adminRouter";

// Stripe webhook
import { stripeWebhookRouter } from "./routers/stripeWebhook";
import { authorizeRole } from "./middelware/authorizeRole";


const liveReloadServer: LiveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "public"));
liveReloadServer.server.once("connection", () => {
  setTimeout(() => liveReloadServer.refresh("/"), 100);
});

const app: Express = express();
app.use(connectLivereload());

app.set("view engine", "ejs");

// 🚨 WEBHOOK MOET BOVEN ALLES STAAN
app.use("/", stripeWebhookRouter());

// Normale parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "../public")));
app.set("views", path.join(__dirname, "../views"));

app.use(cookieParser());

app.set("port", process.env.PORT ?? 3000);

// Sessions + middleware
app.use(sessionMiddleware);
app.use(flashMiddleware);
app.use(secureMiddleware);
app.use(assignGuestId);
app.use(setLocals);

// Routers
app.use(loginRouter());
app.use("/contact", contactRouter());
app.use("/bestel", bestelRouter());
app.use("/checkout", checkoutRouter());
app.use("/reviews", reviewsRouter());
app.use("/admin", authorizeRole("admin"), adminRouter);

// Home
app.get("/", async (req, res) => {
  try {
    const reviews = await getReviews();
    res.render("index", {
      title: "Pizza Gusto",
      page: "index",
      reviews,
    });
  } catch (error) {
    console.error("Fout bij ophalen reviews:", error);
    res.render("index", {
      title: "Pizza Gusto",
      page: "index",
      reviews: [],
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).render("error", {
    page: "error",
    title: "Pagina niet gevonden",
    emessage: "Oeps! Deze pagina bestaat niet.",
    user: req.user || null,
  });
});

// Start server
const startServer = async () => {
  try {
    await connect();
    app.listen(app.get("port"), () => {
      console.log("Server running at http://localhost:" + app.get("port"));
    });
  } catch (e) {
    console.error("Failed to start server:", e);
    process.exit(1);
  }
};

startServer();
