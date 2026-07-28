const express=require("express")
const router=express.Router();
const routecontroller=require("../controllers/route")

router.get("/routes/:departure/:arrival/:date",
    routecontroller.getoneroute
);
module.exports=router;