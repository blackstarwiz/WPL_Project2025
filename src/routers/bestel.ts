// src/routers/bestel.ts
import express, { Router } from 'express';
import { getPizzas } from '../database';

export default function bestelRouter() {
  const router: Router = express.Router();

  // GET: toon pizzas
router.get("/", async (req, res, next) => {
  try {
    const pizzas = await getPizzas();
    res.render("bestel", {
      title: "Bestelpagina",   // ✅ voeg dit toe
      pizzas
    });
  } catch (err) {
    next(err);
  }
});

  return router;
}
/* ==== 
  // POST: voeg 1 pizza toe aan bestellingen (Naam, Prijs, Aantal)
  router.post('/', async (req, res, next) => {
    try {
      const Naam = String(req.body.Naam || '').trim();
      const Prijs = Number(req.body.Prijs || 0);
      const Aantal = Math.max(1, Number(req.body.Aantal || 1));

      if (!Naam || !Prijs) {
        // Safety: als alleen itemId binnenkomt, lookup doen
        const itemId = Number(req.body.itemId || 0);
        if (itemId > 0) {
          const pizzas = await getPizzas();
          const found = pizzas.find(p => p.idmenuitems === itemId);
          if (found) {
            await addBestelling({ Naam: found.Naam, Prijs: Number(found.Prijs), Aantal });
            return res.redirect('/bestel');
          }
        }
        return res.status(400).send('Naam en prijs vereist (of geldig itemId).');
      }

      await addBestelling({ Naam, Prijs, Aantal });
      res.redirect('/bestel');
    } catch (e) {
      next(e);
    }
  });

  // POST /bestel/verwijder
  router.post('/verwijder', async (req, res, next) => {
    try {
      const id = Number(req.body.id || req.body.index); // ondersteunt <input name="id"> of legacy "index"
      if (!Number.isFinite(id)) return res.status(400).send('Ongeldig id');
      await deleteBestelling(id);
      res.redirect('/bestel');
    } catch (e) {
      next(e);
    }
  });

  return router;
}
 ==== */