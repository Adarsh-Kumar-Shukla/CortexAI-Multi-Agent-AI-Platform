import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"

dotenv.config()

const port=process.env.PORT

const app=express()
app.use(express.json())


app.listen(port, ()=>{
  console.log(`chat started at ${port}`)
  connectDB()
})

app.get("/", (req, res)=>{
  res.json({message:"hello from chat"})
})