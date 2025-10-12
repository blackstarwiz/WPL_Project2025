// src/database.ts
import 'dotenv/config';
import mysql from 'mysql2/promise';

/* ==== VERPLICHTE DB-CONNECTIE ==== */
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

/* ==== PIZZAS LADEN UIT DB ==== */
export type PizzaRow = {
  idmenuitems: number;
  Naam: string;
  Beschrijving: string | null;
  Prijs: string; // DECIMAL => string
  AfbeeldingURL: string | null;
};

export async function getPizzas(): Promise<PizzaRow[]> {
  return query<PizzaRow>(`
    SELECT
      ROW_NUMBER() OVER (ORDER BY mi.\`Naam\`) AS idmenuitems,
      mi.\`Naam\`,
      mi.\`Beschrijving\`,
      mi.\`Prijs\`,
      mi.\`AfbeeldingURL\`
    FROM \`menuitems\` mi
    WHERE mi.\`Beschikbaar\` = 1
    ORDER BY mi.\`Naam\`
  `);
}

/* ==== BESTELLING ==== */
export type BestellingView = {
  id: number;             // idbestellingDetails
  bestellingId: number;   // BestellingId
  Naam: string;
  Prijs: string;
  Aantal: number;
  Subtotaal: string;
};

export async function getBestellingen(limit = 20): Promise<BestellingView[]> {
  return query<BestellingView>(`
    SELECT
      bd.\`idbestellingDetails\` AS id,
      bd.\`BestellingId\`        AS bestellingId,
      mi.\`Naam\`                AS Naam,
      mi.\`Prijs\`               AS Prijs,
      bd.\`Aantal\`              AS Aantal,
      bd.\`Subtotaal\`           AS Subtotaal
    FROM \`bestellingdetails\` bd
    JOIN \`menuitems\` mi
      ON mi.\`idmenuItems\` = bd.\`ItemId\`
    ORDER BY bd.\`idbestellingDetails\` DESC
    LIMIT ?
  `, [limit]);
}

export async function addBestelling(opts: { Naam: string; Prijs: number; Aantal: number; }): Promise<void> {
  const { Naam, Aantal } = opts;

  const items = await query<{ idmenuItems: number; Prijs: string }>(`
    SELECT \`idmenuItems\`, \`Prijs\`
    FROM \`menuitems\`
    WHERE \`Naam\` = ?
    LIMIT 1
  `, [Naam]);

  if (items.length === 0) throw new Error(`Menu-item niet gevonden: \${Naam}`);

  const itemId = items[0].idmenuItems;
  const prijsNum = Number(items[0].Prijs);
  const aantal = Math.max(1, Number(Aantal) || 1);
  const subtotaal = prijsNum * aantal;

  await query(`
    INSERT INTO \`bestellingen\`
      (\`UserId\`, \`DatumBestelling\`, \`BetaalStatus\`, \`Status\`, \`TransactieId\`, \`TotaalBedrag\`)
    VALUES (NULL, NOW(), 0, 0, NULL, ?)
  `, [subtotaal]);

  const header = await query<{ id: number }>(`SELECT LAST_INSERT_ID() as id`);
  const bestellingId = header[0].id;

  await query(`
    INSERT INTO \`bestellingdetails\` (\`BestellingId\`, \`ItemId\`, \`Aantal\`, \`Subtotaal\`)
    VALUES (?, ?, ?, ?)
  `, [bestellingId, itemId, aantal, subtotaal]);

  await query(`
    UPDATE \`bestellingen\`
    SET \`TotaalBedrag\` = (
      SELECT SUM(\`Subtotaal\`) FROM \`bestellingdetails\` WHERE \`BestellingId\` = ?
    )
    WHERE \`idbestellingen\` = ?
  `, [bestellingId, bestellingId]);
}

export async function deleteBestelling(idDetail: number): Promise<void> {
  const r = await query<{ BestellingId: number }>(`
    SELECT \`BestellingId\` FROM \`bestellingdetails\`
    WHERE \`idbestellingDetails\` = ?
  `, [idDetail]);
  if (!r.length) return;

  const bestellingId = r[0].BestellingId;

  await query(`
    DELETE FROM \`bestellingdetails\`
    WHERE \`idbestellingDetails\` = ?
  `, [idDetail]);

  await query(`
    UPDATE \`bestellingen\`
    SET \`TotaalBedrag\` = (
      SELECT COALESCE(SUM(\`Subtotaal\`), 0)
      FROM \`bestellingdetails\`
      WHERE \`BestellingId\` = ?
    )
    WHERE \`idbestellingen\` = ?
  `, [bestellingId, bestellingId]);

  await query(`
    DELETE FROM \`bestellingen\`
    WHERE \`idbestellingen\` = ?
    AND NOT EXISTS (
      SELECT 1 FROM \`bestellingdetails\` WHERE \`BestellingId\` = ?
    )
  `, [bestellingId, bestellingId]);
}
