const express=require("express")
const router=express.Router();
const customercontroller=require("../controllers/customer")

router.post("/customer",customercontroller.addnewcustomer)

module.exports=router;
