import { Request, Response } from "express";
import Farm from "../models/farm";

const getFarm = async (req: Request, res: Response) => {
  try {
    const farmId = req.params.farmId;

    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({ message: "farm not found" });
    }

    res.json(farm);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const searchFarm = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;

    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedProduce = (req.query.selectedProduce as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";

    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};

    //check if city matches any farm
    query["city"] = new RegExp(city, "i");
    const cityCheck = await Farm.countDocuments(query);
    if (cityCheck === 0) {
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    if (selectedProduce) {
      const produceArray = selectedProduce
        .split(",")
        .map((produce) => new RegExp(produce, "i"));

      query["produce"] = { $all: produceArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { farmName: searchRegex },
        { produce: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    //"lastUpdated" as default
    const farms = await Farm.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Farm.countDocuments(query);

    const response = {
      data: farms,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  searchFarm,
  getFarm,
};
