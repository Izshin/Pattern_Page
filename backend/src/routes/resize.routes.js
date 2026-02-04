import express from "express";
import { resize } from "../controllers/calc.controller.js";

const router = express.Router();

router.post("/", resize);
export default router;