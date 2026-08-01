import express from "express"
import isAuth from "../middleware/isAuth.js"
import { generateNotes } from "../controllers/generate.controller.js"

const generateRouter = express.Router()

generateRouter.post("/generate-notes", isAuth, generateNotes)

export default generateRouter