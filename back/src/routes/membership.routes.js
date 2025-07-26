import { getAllMembership } from "../controllers/membership.controller.js";
import { getMembershipById } from "../controllers/membership.controller.js";
import { updateMembershipById } from "../controllers/membership.controller.js";
import { deleteMembershipById } from "../controllers/membership.controller.js";
import express from "express";
const router = express.Router();

router.get("/",getAllMembership);
router.get("/:id",getMembershipById);
router.put("/:id", updateMembershipById);
router.delete("/:id",deleteMembershipById);

export default router;