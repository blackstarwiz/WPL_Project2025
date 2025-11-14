import { MONGODB_URI } from "./database";
import session from "express-session";
import mongoDbSession from "connect-mongodb-session";
import { Cart, FlashMessage, Form } from "./types/interface";

const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
  databaseName: "gustoitaliano",
});

declare module "express-session" {
  export interface SessionData {
    message?: FlashMessage;
    cart?: Cart;
    formData?: Form;
  }
}

export default session({
  secret: process.env.SESSION_SECRET ?? "sewey",
  store: mongoStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 2,
  },
});
