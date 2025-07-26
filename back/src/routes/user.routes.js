import { getAllUsers } from "../controllers/user.controller.js";
import { getUserById } from "../controllers/user.controller.js";
import { updateUserById } from "../controllers/user.controller.js";
import { deleteUserById } from "../controllers/user.controller.js"

import express from "express";
const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUserById);
router.delete("/:id", deleteUserById);

export default router;