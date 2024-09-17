import express from "express";
import { param } from "express-validator";
import FarmController from "../controllers/FarmController";

const router = express.Router();

router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City parameter must be a valid string"),
  FarmController.searchFarm
);

export default router;
