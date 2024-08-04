import express from "express";
import { rateLimit } from "express-rate-limit";
import { register, signIn } from "../conteollers/authController.js";

//in rate linit
const limiter = rateLimit({
  WindowMs: 15 * 60 * 1000, //15 min
  max: 100, //linit 100ip request per window here per 15min
  standardHeaders: true, //Return rate limit in the 'Rate limit' hearder
  legacyHeaders: false, //disible the 'X-RateLinit'
});

const router = express.Router();

//Register routes

router.post("/register", limiter, register);
router.post("/login", limiter, signIn);

export default router;
