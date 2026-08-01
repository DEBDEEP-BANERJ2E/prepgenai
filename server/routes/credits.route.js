
import express from "express"
import isAuth from "../middleware/isAuth.js"
import { createCreditsOrder } from "../controllers/credits.controller.js"

const creditRoute = express.Router()

creditRoute.post("/order", isAuth, createCreditsOrder)

export default creditRoute