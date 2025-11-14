import { MongoClient, ObjectId } from "mongodb";
import { Request } from "express";
import { Cart, CartItem, Pizza, User, Review } from "./types/interface";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
const jsonMenuData: Pizza[] = require("./data/menu.json");
const jsonReviewsData: Review[] = require("./data/reviews.json");

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

export const reviewCollection = client
  .db("gustoitaliano")
  .collection<Review>("reviews");

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
    if ((await pizzaCollection.countDocuments()) > 0) {
      return;
    }
    await pizzaCollection.insertMany(jsonMenuData);
  } catch (e: any) {
    console.log("Er ging iets van met pizzaSeed", e);
  }
}

async function reviewsSeed() {
  try {
    //await reviewCollection.deleteMany({}); // verwijderd alle reviewdata handig in test
    if ((await reviewCollection.countDocuments()) > 0) {
      return;
    }
    await reviewCollection.insertMany(jsonReviewsData);
    console.log("Reviews succesvol toegevoegd aan database");
  } catch (e: any) {
    console.log("Er ging iets mis met reviewsSeed", e);
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
  console.log("Poging tot database verbinding en initialisatie...");
  await client.connect();
  try {
    await createInitialUser();
    await pizzaSeed();
    await reviewsSeed();
    console.log("Connected to database");
    process.on("SIGINT", exit);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getReviews(): Promise<Review[]> {
  return await reviewCollection.find().toArray();
}

//Loginfuncties
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

//Registratiefuncties
export async function emailCheck(email: string): Promise<boolean> {
  if (!email) {
    return false;
  }

  const user = await userCollection.findOne({ email });
  return user ? true : false;
}

export function passwCheck(password: string, confirmPassw: string): boolean{
  return password !== confirmPassw ? true : false;
}

export async function createUser(
  email: string,
  password: string,
  phone: string,
  name: string
) {

  await userCollection.insertOne({
    email,
    password: await bcrypt.hash(password, saltRounds),
    phone,
    name,
    role: "USER"
  });

}

//Bestelfuncties
export async function getPizzas(): Promise<Pizza[]> {
  return await pizzaCollection.find().sort({ price: 1 }).toArray();
}

export async function findPizza(pizzaName: string): Promise<Pizza | null> {
  return await pizzaCollection.findOne({ name: pizzaName });
}

export function addPizzaToCartHandler(req: Request) {
  const { pizza, price, image, amount } = req.body; // <-- pizza i.p.v. name

  const parsedPrice = parseFloat(price);
  const parsedAmount = parseInt(amount);

  if (!pizza || isNaN(parsedPrice) || isNaN(parsedAmount)) {
    console.log("Geen geldige pizza of prijs ontvangen", req.body);
    return;
  }

  if (!req.session.cart) {
    req.session.cart = { guestId: uuidv4(), items: [], totalPrice: 0 };
  }

  if (req.user && req.user._id) {
    req.session.cart.userId = new ObjectId(req.user._id);
  }

  const cart = req.session.cart;

  const newItem: CartItem = {
    name: pizza, // hier gebruik je pizza.name
    price: parsedPrice,
    amount: parsedAmount,
    image,
  };

  const existingItem = cart.items.find((item) => item.name === newItem.name);

  if (existingItem) {
    existingItem.amount += parsedAmount; // overschrijven
  } else {
    cart.items.push(newItem);
  }

  req.session.cart.totalPrice = req.session.cart.items.reduce(
    (acc, item) => acc + item.price * item.amount,
    0
  );

  console.log("guestId " + cart.guestId);
}

export function updateAmountInEjs(
  pizza: Pizza,
  cart: Cart | undefined
): number {
  const item = cart?.items.find((i) => i.name === pizza.name);
  return item ? item.amount : 1;
}

export function updateCartItemAmount(
  req: Request,
  itemName: string
): CartItem | null {
  const cart = req.session.cart;
  if (!cart) return null;

  const existingItem = cart.items.find((item) => item.name === itemName);
  if (!existingItem) return null;

  const amount = parseInt(req.body.amount);
  if (isNaN(amount) || amount < 1) return existingItem;

  existingItem.amount = amount;
  cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.amount, 0);

  return existingItem;
}

export function totalAmountCartItems(cart: Cart | undefined): number {
  let totalAmount: number = 0;
  if (!cart) {
    return 0;
  }
  const items = cart.items;
  if (!items) {
    return totalAmount;
  }
  totalAmount = items.reduce((acc, item) => acc + item.amount, 0);
  return totalAmount;
}

export function removePizzaFromSessionCart(req: Request, pizzaName: string) {
  if (!req.session.cart) return;

  req.session.cart.items = req.session.cart.items.filter(
    (item) => item.name !== pizzaName
  );

  req.session.cart.totalPrice = req.session.cart.items.reduce(
    (acc, item) => acc + item.price * item.amount,
    0
  );
}
