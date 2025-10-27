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
import { assignGuestId } from "./middelware/assignGuestId";
import checkoutRouter from "./routers/checkoutRouter";

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
app.use(assignGuestId);
app.use(setLocals);

//Routers
app.use(loginRouter());
app.use("/contact", secureMiddleware, contactRouter());
app.use("/bestel", secureMiddleware, bestelRouter());
app.use("/checkout", secureMiddleware, checkoutRouter());

app.get("/", secureMiddleware, (req, res) => {
  console.log(res.locals.message);
  res.render("index", {
    title: "Pizza Gusto",
    page: "index",
  });
});

app.use((req, res) => {
  res.status(404).render("error", {
    page: 'error',
    title: "Pagina niet gevonden",
    emessage: "Oeps! Deze pagina bestaat niet.",
    user: req.user || null,
  });
});

const startServer = async () => {
  try {
    await connect(); // Connect DB first
    app.listen(app.get("port"), () => {
      console.log("Server running at http://localhost:" + app.get("port"));
    });
  } catch (e) {
    console.error("Failed to start server:", e);
    process.exit(1);
  }
};

startServer();
