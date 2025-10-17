import dotenv from "dotenv"
dotenv.config();  

import mongoose from "mongoose"
import connectDB from "./db/connection.js"
import app from "./app.js";

const port = process.env.PORT;

connectDB()
.then(()=>{
  app.listen(port || 8080, ()=>{
    console.log('server is running at PORT:', port)
  })
  app.on("error", (error)=> {
    console.log("ERROR:", error)
    throw error
  })
})
.catch((err)=>{
  console.log("Failed connection", err)
})