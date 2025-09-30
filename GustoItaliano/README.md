# WPL_Project2025 - Gusto Italiano

Project in teamverband: het opzetten van een webapplicatie genaamd **Gusto Italiano**.
De app is gebouwd met **TypeScript**, **Node.js**, **Express**, en **EJS** templates.

---

## Quick Start (Lokaal)

Clone de repository, installeer dependencies, build het project en start de server:

```bash
git clone https://github.com/blackstarwiz/WPL_Project2025.git
cd WPL_Project2025/GustoItaliano
npm install
npm run build
npm start
```

Open je browser en ga naar:

```
http://localhost:3000
```

> Voor development met live reload:

```bash
npm run dev
```

---

## Projectstructuur

```
GustoItaliano/
├─ src/         # TypeScript code
├─ dist/        # Gecompileerde JavaScript
├─ views/       # EJS templates
├─ public/      # CSS, JS, assets
├─ routers/     # Route handlers
├─ middelware/  # Middleware functies
└─ package.json
```

### Frontend

- `views/` → EJS templates voor dynamische HTML
- `public/` → Statische bestanden

  - `public/css/` → Stylesheets
  - `public/js/` → Frontend JavaScript
  - `public/assets/` → Afbeeldingen, icons, fonts

### Backend

- `src/` → TypeScript-servercode
- `dist/` → Gecompileerde JavaScript-bestanden (via `npm run build`)
- `index.ts` → Hoofdserverbestand
- `routers/` → Routes voor login, contact en bestellen
- `middelware/` → Middleware functies zoals `setLocals`

---

## Deployment op Render

1. Maak een **Web Service** aan in Render (geen Static Site).
2. Koppel de repository: `WPL_Project2025`.
3. Stel **Root Directory** in op:

```
GustoItaliano
```

4. Build Command:

```bash
npm install && npm run build
```

5. Start Command:

```bash
npm start
```

> Render zet automatisch de `PORT` environment variable, die de server gebruikt.

Na deploy is je app bereikbaar op:

```
https://<jouw-render-subdomain>.onrender.com/
```

---

## Tips & Opmerkingen

- Zorg dat `views/` en `public/` **naast** `src/` en `dist/` blijven zodat Express ze correct kan vinden.
- Voor development gebruik `npm run dev` met `nodemon` en `ts-node`.
- Voor production draait de server via `npm start` op de gecompileerde bestanden in `dist/`.
- Gebruik `npm run build` elke keer als je TypeScript-bestanden wijzigt voordat je `npm start` uitvoert.

---

## Dependencies

- Node.js
- TypeScript
- Express
- EJS
- dotenv
- Nodemon (dev)
- Jest (dev/test)

---

## License

ISC
