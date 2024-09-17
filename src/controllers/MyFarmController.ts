import { Request, Response } from "express";
import Farm from "../models/farm";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

const getMyFarm = async (req: Request, res: Response) => {
  try {
    const farm = await Farm.findOne({ user: req.userId });

    if (!farm) {
      return res.status(404).json({ message: "farm not found" });
    }

    res.json(farm);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching farm" });
  }
};

const createMyFarm = async (req: Request, res: Response) => {
  try {
    const existingFarm = await Farm.findOne({ user: req.userId });

    if (existingFarm) {
      return res.status(409).json({ message: "User farm already exists" });
    }

    //file object added by multer in middleware
    // const image = req.file as Express.Multer.File;
    // const base64Image = Buffer.from(image.buffer).toString("base64");
    // const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    // const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const farm = new Farm(req.body);
    farm.imageUrl = imageUrl;
    farm.user = new mongoose.Types.ObjectId(req.userId);

    farm.lastUpdated = new Date();
    await farm.save();

    res.status(201).send(farm);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong :(" });
  }
};

const updateMyFarm = async (req: Request, res: Response) => {
  try {
    const farm = await Farm.findOne({
      user: req.userId,
    });

    if (!farm) {
      return res.status(404).json({ message: "farm not found" });
    }

    farm.farmName = req.body.farmName;
    farm.city = req.body.city;
    farm.country = req.body.country;
    farm.deliveryPrice = req.body.deliveryPrice;
    farm.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    farm.produce = req.body.produce;
    farm.menuItems = req.body.menuItems;
    farm.lastUpdated = new Date();

    //new image
    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      farm.imageUrl = imageUrl;
    }

    await farm.save();
    res.status(200).send(farm);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  //file object added by multer in middleware
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  createMyFarm,
  getMyFarm,
  updateMyFarm,
};
