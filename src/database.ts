import * as fs from "fs";
import * as path from "path";

let naam: string[] = [
  "Calzone",
  "Capricciosa",
  "Frutti di Mare",
  "Fungi",
  "Hawaii",
  "Margarita",
  "Pepperoni",
  "Prosciutto",
  "Prosciutto",
  "Prosciutto",
  "Quattro Stagioni",
  "Salami",
  "Tonno",
];
import { MongoClient } from "mongodb";
import { Request } from "express";
import { User } from "./types/interface";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

export const MONGODB_URI =
  typeof process.env.MONGO_URI === "string" ? process.env.MONGO_URI : "";
export const saltRounds: number = 10;

const client = new MongoClient(MONGODB_URI);

export const userCollection = client
  .db("gustoitaliano")
  .collection<User>("users");

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
    throw e; // Zorg dat de fout doorgaat naar de 'connect' catch blok
  }
}

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
    return false; // Geen token gevonden
  }

  try {
    // Gebruik jwt.verify synchroon (zonder callback) om direct true/false te krijgen
    jwt.verify(token, process.env.JWT_SECRET!);

    // Als de verificatie slaagt zonder fouten, is de gebruiker ingelogd
    return true;
  } catch (err) {
    // Als er een fout is (bijv. verlopen token), is de gebruiker niet geldig ingelogd
    return false;
  }
}

export interface MenuItem {
  naam: string;
  foto: string;
}

export let bestellingen: string[] = [];

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
    console.log("Poging tot database verbinding en initialisatie..."); // NIEUW
    await createInitialUser();
    await client.connect();
    console.log("Connected to database");
    process.on("SIGINT", exit);
  } catch (error) {
    console.error(error);
  }
}

function humanNameFromFilename(filename: string) {
  try {
    naam.forEach((element) => {
      return element.toString();
    });
  } catch (err) {
    return "";
  }
}

function loadMenuFromDir(
  relDir = "public/assets/images/pizza_images"
): MenuItem[] {
  try {
    const imagesDir = path.join(process.cwd(), relDir);

    if (!fs.existsSync(imagesDir)) return [];

    const files = fs
      .readdirSync(imagesDir)
      .filter((f) => /^pizza_.+\.(png|png)$/i.test(f));

    return files.map((f) => ({
      naam: humanNameFromFilename(f) || "",
      foto: `assets/images/pizza_images/${f}`,
    }));
  } catch (err) {
    return [];
  }
}

export let menu: MenuItem[] = loadMenuFromDir();
