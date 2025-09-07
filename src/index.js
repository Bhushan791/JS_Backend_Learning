
import dotenv from "dotenv"
import mongoose from "mongoose"
import connectDB from "./db/connection.js"
import app from "./app.js";
dotenv.config();

const port = process.env.PORT;

connectDB()
.then(()=>{

  app.listen(port || 8080, ()=>{
    console.log('server is running at PORT:' , port)
  })
  app.on("error", (error)=> {
        console.log("ERROR:" , error)
        throw error
      })
})


.catch((err)=>{
  console.log("Filed connection", err)

})


















/*


//APPROACH 1  IIFE(Immediately Invoked Function Expression)

import express from "express";
const port = process.env.PORT;

const app = express()
( async()=>{

    try{

      await  mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`)
      app.on("error", (error)=> {
        console.log("ERROR:" , error)
        throw error
      })

      app.listen(port, ()=>{
        console.log("app is listening in Port:", port)
      } )

    }
    catch(error){
        console.error("Error", error)
    }
})()


*/