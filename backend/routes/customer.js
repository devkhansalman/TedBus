const express=require("express")
const router=express.Router();
const customercontroller=require("../controllers/customer")

router.post("/customer",customercontroller.addnewcustomer)
router.get("/api/profile/theme", customercontroller.requireAuthenticatedCustomer, customercontroller.getThemePreference)
router.put("/api/profile/theme", customercontroller.requireAuthenticatedCustomer, customercontroller.updateThemePreference)
router.get("/users/preferences/language", customercontroller.requireAuthenticatedCustomer, customercontroller.getLanguagePreference)
router.patch("/users/preferences/language", customercontroller.requireAuthenticatedCustomer, customercontroller.updateLanguagePreference)

module.exports=router;
