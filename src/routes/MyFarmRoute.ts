import express from "express";
import multer from "multer";
import MyFarmController from "../controllers/MyFarmController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyFarmRequest } from "../middleware/validation";

const router = express.Router();

//take image file from req and store it in memory, add file as obj to req
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

// /api/my/farm
router.post(
  "/",
  upload.single("imageFile"),
  validateMyFarmRequest,
  jwtCheck,
  jwtParse,
  MyFarmController.createMyFarm
);

export default router;
