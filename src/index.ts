import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { setLocals } from "./middelware/locals";
import bestelRouter from "./routers/bestel";
import contactRouter from "./routers/contact";
import loginRouter from "./routers/login";
import livereload, { LiveReloadServer } from "livereload";
import connectLivereload from "connect-livereload";

dotenv.config();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Voor gecompileerde app in dist/
app.use(express.static(path.join(__dirname, "../public")));
app.set("views", path.join(__dirname, "../views"));

app.set("port", process.env.PORT ?? 3000);

// Middleware voor locals
app.use(setLocals);

//Routers
app.use("/login", loginRouter());
app.use("/contact", contactRouter());
app.use("/bestel", bestelRouter());

app.get("/", (req, res) => {
  res.render("index", {
    title: "Hello World",
    page: "index",
    message: "Hello World",
  });
});

app.listen(app.get("port"), () => {
  console.log("Server started on http://localhost:" + app.get("port"));
});
