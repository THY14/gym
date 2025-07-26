import { getAllClasses } from "../controllers/class.controller.js";

import express from "express";
const router = express.Router();

router.get("/", getAllClasses);

export default router;