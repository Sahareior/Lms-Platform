import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  toggleFavorite,
  getMyFavorites,
  getFavoriteQuestionIds,
} from "../controller/FavoriteController.js";

const favoriteRoutes = express.Router();

// All favorite routes require authentication
favoriteRoutes.post("/toggle", authenticate, toggleFavorite);
favoriteRoutes.get("/", authenticate, getMyFavorites);
favoriteRoutes.get("/ids", authenticate, getFavoriteQuestionIds);

export default favoriteRoutes;
