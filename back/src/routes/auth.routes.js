import { login, register } from "../controllers/auth.controller.js"; 
import { verifyToken } from "../middleware/verifyToken.middleware.js";
import { checkRole } from "../middleware/checkRole.middleware.js";

import express from "express";

const router = express.Router();

router.post("/register", register);
router.post("/login",login);

export default router;