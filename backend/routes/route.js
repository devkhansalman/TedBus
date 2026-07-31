const express = require("express");
const router = express.Router();
const routecontroller = require("../controllers/route");

router.get("/routes/:departure/:arrival/:date", routecontroller.getoneroute);
router.get("/routes/map-details/:departure/:arrival", routecontroller.getRouteDetails);

module.exports = router;