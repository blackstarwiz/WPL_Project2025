// src/database.ts
import 'dotenv/config';
import mysql from 'mysql2/promise';

/* ==== VERPLICHTE DB-CONNECTIE (geen fallback) ==== */
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  throw new Error('DB env vars ontbreken (DB_HOST/DB_USER/DB_NAME).');
}

export const pool = mysql.createPool({
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
  await pool.query('SELECT 1');
  console.log('✅ MySQL connected');
})();

/* ==== HELPER ==== */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

/* ==== PIZZA’S ==== */
export type PizzaRow = {
  idmenuitems: number;
  Naam: string;
  Beschrijving: string | null;
  Prijs: string; // DECIMAL komt als string
  AfbeeldingURL: string | null;
};

export async function getPizzas(): Promise<PizzaRow[]> {
  // filter op categorie-naam 'Pizza' + Beschikbaar = 1
  return query<PizzaRow>(`
    SELECT mi.idmenuitems, mi.Naam, mi.Beschrijving, mi.Prijs, mi.AfbeeldingURL
    FROM \`menuitems\` mi
    LEFT JOIN \`menucategorieën\` mc ON mc.idmenucategorieën = mi.CategorieId
    WHERE mi.Beschikbaar = 1 AND mc.Naam = 'Pizza'
    ORDER BY mi.Naam
  `);
}

/* ==== BESTELLINGEN ==== */
export type BestellingRow = {
  idbestellingen: number;
  Naam: string;
  Prijs: string;
  Aantal: number;
  created_at: Date;
};

export async function getBestellingen(): Promise<BestellingRow[]> {
  return query<BestellingRow>(`
    SELECT idbestellingen, Naam, Prijs, Aantal, created_at
    FROM \`bestellingen\`
    ORDER BY idbestellingen DESC
  `);
}

export async function addBestelling(opts: { Naam: string; Prijs: number; Aantal: number; }): Promise<void> {
  await query(
    `INSERT INTO \`bestellingen\` (Naam, Prijs, Aantal, created_at) VALUES (?, ?, ?, NOW())`,
    [opts.Naam, opts.Prijs, opts.Aantal]
  );
}

export async function deleteBestelling(idbestellingen: number): Promise<void> {
  await query(`DELETE FROM \`bestellingen\` WHERE idbestellingen = ?`, [idbestellingen]);
}
