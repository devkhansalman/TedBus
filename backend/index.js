const express = require("express")
const bodyparse = require("body-parser")

const cors = require("cors")
const mongoose = require("mongoose")
const app=express()
// const customerroutes=require('./routes/customer')

const PORT=8000

require('dotenv').config(); //load all environment variables from main configuration.
;

app.use(cors())
app.use(bodyparse.json())
// app.use(customerroutes)


const customerroutes=require("./routes/customer");
const routesroute=require("./routes/route");
const bookingroute=require("./routes/booking")
const reviewroute=require("./routes/review");
const notificationroute = require('./routes/notification');
const communityroute = require('./routes/community');

app.use(bookingroute)
app.use(routesroute)
app.use(customerroutes)
app.use(reviewroute)
app.use(notificationroute)
app.use(communityroute)


const DB_URL=`${process.env.DB_URL}`
mongoose.connect(DB_URL)
.then(()=>console.log("Connected successfully"))
.catch((err)=>console.error("Error in connecting to DB", err))

app.get("/",(req,res)=>{
    res.send({message:"Hello from tedbus server bro!"})
})


app.listen(PORT,()=>{
    console.log(`Server running on PORT: ${PORT}`);
})
