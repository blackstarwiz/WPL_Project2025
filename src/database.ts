// src/database.ts
import dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config();

/* ===== FALLBACK GEHEUGEN DATA ===== */
export type MenuItem = { naam: string; foto: string };
let memoryMenu: MenuItem[] = [
  { naam: "Diavola", foto: "/images/diavola.jpg" },
];
let memoryBestellingen: string[] = [];

/* ===== MYSQL POOL ===== */
const useDb =
  !!process.env.DB_HOST &&
  !!process.env.DB_USER &&
  !!process.env.DB_NAME;

let pool: mysql.Pool | null = null;

if (useDb) {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  (async () => {
    try {
      await pool!.query("SELECT 1");
      console.log("✅ Verbonden met MySQL database");
    } catch (error) {
      console.warn("⚠️ Geen MySQL connectie, fallback naar geheugen.");
      pool = null;
    }
  })();
}

/* ===== QUERY HELPER ===== */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  if (!pool) {
    throw new Error("Database niet verbonden, query() niet beschikbaar.");
  }
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

/* ===== PIZZA'S LADEN ===== */
export type PizzaRow = {
  idmenuitems: number;
  Naam: string;
  Beschrijving: string | null;
  Prijs: string;
  AfbeeldingURL: string | null;
};

export async function getPizzas(): Promise<PizzaRow[]> {
  // Fallback zonder database
  if (!pool) {
    return memoryMenu.map((m, i) => ({
      idmenuitems: i + 1,
      Naam: m.naam,
      Beschrijving: null,
      Prijs: "0.00",
      AfbeeldingURL: m.foto,
    }));
  }

  // Probeer filter op categorie "Pizza"
  try {
    const rows = await query<PizzaRow>(
      `
      SELECT mi.idmenuitems, mi.Naam, mi.Beschrijving, mi.Prijs, mi.AfbeeldingURL
      FROM \`menuitems\` mi
      LEFT JOIN \`menucategorieën\` mc
      ON mc.idmenucategorieën = mi.CategorieId
      WHERE mi.Beschikbaar = 1 AND mc.Naam = 'Pizza'
      ORDER BY mi.Naam ASC;
    `
    );
    return rows;
  } catch (error) {
    console.error("❌ Fout bij ophalen pizzas:", error);
    return [];
  }
}
