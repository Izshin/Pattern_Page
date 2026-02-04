import express from "express";
import { calculate, resize } from "../controllers/calc.controller.js";

const router = express.Router();

router.post("/", calculate);
router.post("/resize", resize);
export default router;
