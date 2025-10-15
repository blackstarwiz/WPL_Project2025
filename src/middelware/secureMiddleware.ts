import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

export function secureMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  //const token haalt uit de cookies de jwt, als die bestaat wordt er een string meegegeven anders undefined
  const token: string | undefined = req.cookies?.jwt;

  res.locals.user = undefined;
  //Bestaat de Json web token?
  //zo niet dan wordt er onderstaande code uitgevoerd, er wordt iets getoond in de console, en je wordt terug naar de login gestuurd
  if (!token) {
    console.log("Geen token gevonden, Ga verder als gast");
    return next();
  }

  //als die bestaat dan gaan we die verifieren om die te kunnen uitlezen
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      console.log("Token ongeldig/verlopen. Ga verder als gast.");
      res.clearCookie("jwt");
      return next();
    } else {
      console.log("Token geverifieerd. Gebruiker is ingelogd", user);
      res.locals.user = user;
      next();
    }
  });
}
