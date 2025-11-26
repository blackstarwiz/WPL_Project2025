import express, { Router } from "express";
import { Review } from "../types/interface";
import { getReviews, reviewCollection } from "../database";

export default function reviewsRouter() {
  const router: Router = express.Router();

  // GET route voor reviews pagina
  router.get("/", async (req, res) => {
    try {
      const reviews: Review[] = await getReviews();
      
      res.render("reviews", {
        title: "Reviews - Pizza Gusto",
        page: "reviews",
        reviews,
        cart: req.session.cart,
      });
    } catch (error) {
      console.error("Fout bij ophalen reviews:", error);
      res.render("reviews", {
        title: "Reviews - Pizza Gusto",
        page: "reviews",
        reviews: [],
        cart: req.session.cart,
      });
    }
  });

  // POST route voor review toevoegen
router.post("/add", async (req, res) => {
  try {
    const { naam, review } = req.body;

    if (!naam || !review) {
      return res.status(400).json({ error: "Naam en review zijn verplicht" });
    }

    const randomProfilePicture = getRandomProfilePicture();

    const newReview: Review = {
      naam,
      review,
      profielfoto: randomProfilePicture,
      datum: new Date()
    };

    await reviewCollection.insertOne(newReview);

    res.status(201).json({ success: true, message: "Review toegevoegd" });
  } catch (error) {
    console.error("Fout bij toevoegen review:", error);
    res.status(500).json({ error: "Interne server error" });
  }
});

function getRandomProfilePicture(): string {
  const profilePictures = [
    "assets/images/pizza_images/pizza_calzone.png",
    "assets/images/pizza_images/pizza_capricciosa.png", 
    "assets/images/pizza_images/pizza_fruttidiMare.png",
    "assets/images/pizza_images/pizza_fungi.png",
    "assets/images/pizza_images/pizza_hawaii.png",
    "assets/images/pizza_images/pizza_margherita.png",
    "assets/images/pizza_images/pizza_pepperoni.png",
    "assets/images/pizza_images/pizza_prosciutto_2.png",
    "assets/images/pizza_images/pizza_quattroStagioni.png",
    "assets/images/pizza_images/pizza_salami.png",
    "assets/images/pizza_images/pizza_tonno.png"
  ];
  
  const randomIndex = Math.floor(Math.random() * profilePictures.length);
  return profilePictures[randomIndex];
}

  return router;
}