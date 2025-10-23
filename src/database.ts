import { MongoClient, ObjectId } from "mongodb";
import { Request } from "express";
import { Cart, CartItem, Pizza, User } from "./types/interface";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { cpuUsage } from "process";
const jsonMenuData: Pizza[] = require("./data/menu.json");

export const MONGODB_URI =
  typeof process.env.MONGO_URI === "string" ? process.env.MONGO_URI : "";
export const saltRounds: number = 10;

const client = new MongoClient(MONGODB_URI);

export const userCollection = client
  .db("gustoitaliano")
  .collection<User>("users");

export const pizzaCollection = client
  .db("gustoitaliano")
  .collection<Pizza>("menu");

export const cartCollection = client
  .db("gustoitaliano")
  .collection<Cart>("cart");

async function createInitialUser() {
  try {
    if ((await userCollection.countDocuments()) > 0) {
      return;
    }

    let email1: string | undefined = process.env.USER1_EMAIL;
    let password1: string | undefined = process.env.USER1_PSW;

    if (email1 === undefined || password1 === undefined) {
      throw new Error(
        "USER1_EMAIL or USER1_PSW moet in de enviroment file komen"
      );
    }

    await userCollection.insertOne({
      email: email1,
      password: await bcrypt.hash(password1, saltRounds),
      role: "ADMIN",
    });
  } catch (e: any) {
    console.error("Fout in createInitialUser:", e.message);
    throw e;
  }
}
async function pizzaSeed() {
  try {
    if ((await userCollection.countDocuments()) > 0) {
      return;
    }
    await pizzaCollection.insertMany(jsonMenuData);
  } catch (e: any) {
    console.log("Er ging iets van met pizzaSeed", e);
  }
}

async function exit() {
  try {
    await client.close();
    console.log("Disconnected from database");
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
}

export async function connect() {
  try {
    console.log("Poging tot database verbinding en initialisatie...");
    await client.connect();
    await createInitialUser();
    await pizzaSeed();
    console.log("Connected to database");
    process.on("SIGINT", exit);
  } catch (error) {
    console.error(error);
  }
}

//HELPFUNCTIES
export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Alle velden zijn verplicht");
  }
  let user: User | null = await userCollection.findOne({ email });
  if (user) {
    if (await bcrypt.compare(password, user.password!)) {
      return user;
    } else {
      throw new Error("Het wachtwoord is onjuist");
    }
  } else {
    throw new Error("Deze user bestaat niet");
  }
}

export function isAuthenticate(req: Request): boolean {
  const token: string | undefined = req.cookies?.jwt;

  if (!token) {
    return false;
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return true;
  } catch (err) {
    return false;
  }
}

export async function findPizza(pizzaName: string) {
  return await pizzaCollection.findOne({ name: pizzaName });
}

export function addPizzaToCart(
  pizza: Pizza,
  amount: number,
  userId?: ObjectId
): Cart {
  const item: CartItem = {
    menuItemId: new ObjectId(),
    name: pizza.name,
    price: pizza.price,
    amount,
    image: pizza.image,
  };

  let items: CartItem[] = [item];

  const totalPrice = items.reduce(
    (acc, curr) => acc + curr.price * curr.amount,
    0
  );

  const myCart: Cart = {
    userId: userId,
    items,
    totalPrice,
  };

  return myCart;
}
