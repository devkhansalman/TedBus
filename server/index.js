const express = require("express")
const bodyparse = require("body-parser")

const cors = require("cors")
const mongoose = require("mongoose")
const app=express()
const customerroutes=require('./routes/customer')

const PORT=8000

app.use(cors())
app.use(bodyparse.json())
app.use(customerroutes)
const DB_URL="mongodb://127.0.0.1:27017/tedbus-server"
mongoose.connect(DB_URL).then(()=>console.log("Connected successfully")).catch((err)=>console.error("Error in connecting to DB", err))

app.get("/",(req,res)=>{
    res.send({message:"Hello from tedbus server bro!"})
})


app.listen(PORT,()=>{
    console.log(`Server running on PORT: ${PORT}`);
})
