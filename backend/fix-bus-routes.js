/**
 * fix-bus-routes.js
 * 
 * Fixes the bus-route association in MongoDB.
 * The buses have stale route ObjectIds. This script:
 *  1. Finds each route by departure/arrival city name
 *  2. Updates matching bus documents to use the correct route _id
 * 
 * Run: node fix-bus-routes.js
 */

const mongoose = require("mongoose");

const DB_URL = "mongodb://127.0.0.1:27017/tedbus-server";

// ─── Schemas ────────────────────────────────────────────────────────────────
const routeSchema = new mongoose.Schema({
  departureLocation: { name: String, subLocations: [String] },
  arrivalLocation: { name: String, subLocations: [String] },
  duration: Number,
});

const busSchema = new mongoose.Schema({
  operatorName: String,
  busType: String,
  departureTime: String,
  rating: [Number],
  totalSeats: Number,
  routes: mongoose.Schema.Types.ObjectId,
  images: String,
  liveTracking: Number,
  reschedulable: Number,
});

const Route = mongoose.model("Routes", routeSchema);
const Bus = mongoose.model("Buses", busSchema);

// ─── Mapping: which operator belongs to which route ─────────────────────────
// Keyed by departure → arrival
const operatorRouteMap = {
  "Delhi→Jaipur": ["MetroBus", "TravelXpress"],
  "Mumbai→Goa": ["FastTransit", "CityLink"],
  "Bangalore→Mysore": ["SwiftTrans", "ExpressLine"],
  "Kolkata→Darjeeling": ["TransitHub", "EliteTravels"],
  "Chennai→Pondicherry": ["TravelMax", "SunriseTransit", "RapidTransport"],
};

async function fixBusRoutes() {
  await mongoose.connect(DB_URL);
  console.log("✅ Connected to MongoDB\n");

  const routes = await Route.find().lean();
  console.log(`Found ${routes.length} routes in DB`);

  for (const route of routes) {
    const dep = route.departureLocation.name;
    const arr = route.arrivalLocation.name;
    const key = `${dep}→${arr}`;
    const operators = operatorRouteMap[key];

    if (!operators) {
      console.log(`⚠️  No operator mapping for ${key}, skipping`);
      continue;
    }

    console.log(`\n📍 Route: ${key} | _id: ${route._id}`);
    console.log(`   Operators to update: ${operators.join(", ")}`);

    const result = await Bus.updateMany(
      { operatorName: { $in: operators } },
      { $set: { routes: route._id } }
    );

    console.log(`   ✅ Updated ${result.modifiedCount} bus(es)`);
  }

  // ─── Verify ──────────────────────────────────────────────────────────────
  console.log("\n─── Verification ───────────────────────────────────────────");
  const allBuses = await Bus.find().lean();
  for (const bus of allBuses) {
    const route = routes.find(r => r._id.toString() === bus.routes?.toString());
    const routeName = route
      ? `${route.departureLocation.name}→${route.arrivalLocation.name}`
      : "❌ ROUTE NOT FOUND";
    console.log(`  ${bus.operatorName.padEnd(18)} routes → ${routeName}`);
  }

  await mongoose.disconnect();
  console.log("\n✅ Done. Bus route IDs are now fixed.");
}

fixBusRoutes().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
