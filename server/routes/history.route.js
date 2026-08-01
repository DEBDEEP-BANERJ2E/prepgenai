import express from "express"
import isAuth from "../middleware/isAuth.js"
import { historyOFNotes } from "../controllers/history.controller.js"

const historyRoute = express.Router()

historyRoute.get("/notes-history", isAuth, historyOFNotes)

export default historyRoute