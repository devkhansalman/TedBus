const express = require("express")
const bodyparse = require("body-parser")

const cors = require("cors")
const mongoose = require("mongoose")
const app=express()
// const customerroutes=require('./routes/customer')

// const PORT=8000

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
const { Timestamp } = require("mongodb");

app.use(bookingroute)
app.use(routesroute)
app.use(customerroutes)
app.use(reviewroute)
app.use(notificationroute)
app.use(communityroute)


const DB_URL = process.env.DB_URL;
if (!DB_URL) {
    console.warn("WARNING: DB_URL environment variable is not defined!");
} else {
    mongoose.connect(DB_URL)
        .then(() => console.log("Connected successfully to DB"))
        .catch((err) => console.error("Error in connecting to DB", err));
}

app.get("/", (req, res) => {
    res.send({ message: "Hello from tedbus server bro!" });
});
app.get("/health", (req, res) => {
    res.status(200).json({ success: true, status: "ok", Timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on PORT: ${PORT}`);
});

