import { MONGODB_URI } from "./database";
import session from "express-session";
import mongoDbSession from "connect-mongodb-session";
import { FlashMessage } from "./types/interface";

const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
  databaseName: "gustoitaliano",
});

declare module "express-session" {
  export interface SessionData {
    message?: FlashMessage;
  }
}

export default session({
  secret: process.env.SESSION_SECRET ?? "sewey",
  store: mongoStore,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 2,
  },
});
