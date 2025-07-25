import { getAllMembers } from "../controllers/members.controller.js";
import { verifyToken } from "../middleware/verifyToken.middleware.js";
import express from "express";
const router = express.Router();


router.get("/", getAllMembers);

export default router;