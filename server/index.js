import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"

import { connectDB } from "./utils/db.utils.js"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import generateRouter from "./routes/generate.route.js"
import pdfRouter from "./routes/pdfDownload.route.js"
import historyRoute from "./routes/history.route.js"
import creditRoute from "./routes/credits.route.js"
import { stripeWebhook } from "./controllers/credits.controller.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000


app.post(
  "/api/credits/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.get("/" , (req, res) =>{
    res.json({message : "Yes i am here"})
})

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/notes", generateRouter)
app.use("/api/pdf", pdfRouter)
app.use("/api/history", historyRoute)
app.use("/api/credit", creditRoute)





app.listen(PORT, ()=> {
    console.log(`Server started at ${PORT}`);
    connectDB()
})