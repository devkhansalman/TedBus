/**
 * Backend Helper for Interactive Route Planning
 * Provides geographical coordinates, polylines, and intermediate stops for bus routes.
 */

const predefinedRoutes = {
  "delhi-jaipur": {
    departure: { name: "Delhi", lat: 28.6139, lng: 77.2090, label: "Kashmere Gate ISBT, Delhi" },
    arrival: { name: "Jaipur", lat: 26.9124, lng: 75.7873, label: "Sindhi Camp, Jaipur" },
    distanceKm: 270,
    durationFormatted: "5 hrs 30 mins",
    stops: [
      { name: "Gurgaon", locationName: "IFFCO Chowk", lat: 28.4595, lng: 77.0266, timeOffset: "+1.0 hr", type: "pickup" },
      { name: "Dharuhera", locationName: "Flyover Junction", lat: 28.2056, lng: 76.7946, timeOffset: "+1.8 hrs", type: "stopover" },
      { name: "Neemrana", locationName: "Midway Plaza Rest Stop", lat: 27.9890, lng: 76.3812, timeOffset: "+2.5 hrs", type: "rest" },
      { name: "Kotputli", locationName: "Bypass Stand", lat: 27.7027, lng: 76.2023, timeOffset: "+3.5 hrs", type: "stopover" },
      { name: "Shahpura", locationName: "Highway Hub", lat: 27.3878, lng: 75.9590, timeOffset: "+4.3 hrs", type: "drop" }
    ]
  },
  "mumbai-pune": {
    departure: { name: "Mumbai", lat: 19.0760, lng: 72.8777, label: "Dadar TT Circle, Mumbai" },
    arrival: { name: "Pune", lat: 18.5204, lng: 73.8567, label: "Swargate, Pune" },
    distanceKm: 150,
    durationFormatted: "3 hrs 15 mins",
    stops: [
      { name: "Vashi", locationName: "Vashi Highway Plaza", lat: 19.0771, lng: 72.9986, timeOffset: "+0.5 hr", type: "pickup" },
      { name: "Panvel", locationName: "Kalamboli Circle", lat: 18.9894, lng: 73.1175, timeOffset: "+1.0 hr", type: "pickup" },
      { name: "Lonavala", locationName: "Expressway Food Court", lat: 18.7557, lng: 73.4091, timeOffset: "+2.0 hrs", type: "rest" },
      { name: "Wakad", locationName: "Wakad Flyover", lat: 18.5987, lng: 73.7688, timeOffset: "+2.8 hrs", type: "drop" }
    ]
  },
  "bangalore-chennai": {
    departure: { name: "Bangalore", lat: 12.9716, lng: 77.5946, label: "Majestic Bus Stand, Bangalore" },
    arrival: { name: "Chennai", lat: 13.0827, lng: 80.2707, label: "Koyambedu CMBT, Chennai" },
    distanceKm: 350,
    durationFormatted: "6 hrs 45 mins",
    stops: [
      { name: "Electronic City", locationName: "Toll Plaza", lat: 12.8452, lng: 77.6602, timeOffset: "+0.6 hr", type: "pickup" },
      { name: "Hosur", locationName: "Bus Stand Flyover", lat: 12.7409, lng: 77.8253, timeOffset: "+1.2 hrs", type: "stopover" },
      { name: "Krishnagiri", locationName: "Toll Gate Plaza", lat: 12.5266, lng: 78.2144, timeOffset: "+2.3 hrs", type: "rest" },
      { name: "Vellore", locationName: "Bypass Junction", lat: 12.9165, lng: 79.1325, timeOffset: "+4.5 hrs", type: "drop" },
      { name: "Kanchipuram", locationName: "Highway Bypass", lat: 12.8342, lng: 79.7036, timeOffset: "+5.5 hrs", type: "drop" }
    ]
  },
  "hyderabad-vijayawada": {
    departure: { name: "Hyderabad", lat: 17.3850, lng: 78.4867, label: "MGBS, Hyderabad" },
    arrival: { name: "Vijayawada", lat: 16.5062, lng: 80.6480, label: "PNBS, Vijayawada" },
    distanceKm: 275,
    durationFormatted: "5 hrs 00 mins",
    stops: [
      { name: "LB Nagar", locationName: "Metro Station", lat: 17.3457, lng: 78.5522, timeOffset: "+0.5 hr", type: "pickup" },
      { name: "Suryapet", locationName: "Highway Food Hub", lat: 17.1439, lng: 79.6239, timeOffset: "+2.2 hrs", type: "rest" },
      { name: "Nandigama", locationName: "Bypass Junction", lat: 16.7766, lng: 80.2878, timeOffset: "+4.0 hrs", type: "drop" }
    ]
  }
};

const knownCityCoords = {
  "delhi": { lat: 28.6139, lng: 77.2090 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "vijayawada": { lat: 16.5062, lng: 80.6480 },
  "ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "surat": { lat: 21.1702, lng: 72.8311 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "kanpur": { lat: 26.4499, lng: 80.3319 },
  "agra": { lat: 27.1767, lng: 78.0081 },
  "chandigarh": { lat: 30.7333, lng: 76.7794 }
};

/**
 * Calculates straight line distance in km between two lat/lng pairs using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.25); // Account for road curvature (~1.25x)
}

/**
 * Retrieves route visualization payload for given departure and arrival cities
 */
exports.getRouteMapData = (departureCity, arrivalCity, bus = null) => {
  const depKey = String(departureCity || 'Delhi').trim().toLowerCase();
  const arrKey = String(arrivalCity || 'Jaipur').trim().toLowerCase();
  const routeKey = `${depKey}-${arrKey}`;

  // Check if predefined exact route exists
  if (predefinedRoutes[routeKey]) {
    const data = predefinedRoutes[routeKey];
    const polyline = [
      [data.departure.lat, data.departure.lng],
      ...data.stops.map(s => [s.lat, s.lng]),
      [data.arrival.lat, data.arrival.lng]
    ];
    return {
      routeName: `${data.departure.name} to ${data.arrival.name}`,
      departure: data.departure,
      arrival: data.arrival,
      distanceKm: data.distanceKm,
      durationFormatted: data.durationFormatted,
      totalStops: data.stops.length,
      stops: data.stops,
      polyline,
      busDetails: {
        operatorName: bus?.operatorName || 'Tedbus Express Partner',
        busType: bus?.busType || 'A/C Sleeper (2+1)',
        rating: Array.isArray(bus?.rating) && bus.rating.length ? (bus.rating.reduce((a, b) => a + b, 0) / bus.rating.length).toFixed(1) : 4.5
      }
    };
  }

  // Dynamic calculation for custom routes
  const depCoords = knownCityCoords[depKey] || { lat: 28.6139, lng: 77.2090 };
  const arrCoords = knownCityCoords[arrKey] || { lat: 26.9124, lng: 75.7873 };
  const dist = calculateDistance(depCoords.lat, depCoords.lng, arrCoords.lat, arrCoords.lng);
  const hours = Math.floor(dist / 50);
  const mins = Math.round((dist % 50) * 1.2);
  const durationFormatted = `${hours} hrs ${mins} mins`;

  // Interpolate intermediate stops
  const stops = [
    {
      name: `${departureCity} Outskirts`,
      locationName: "Bypass Junction",
      lat: +(depCoords.lat + (arrCoords.lat - depCoords.lat) * 0.25).toFixed(4),
      lng: +(depCoords.lng + (arrCoords.lng - depCoords.lng) * 0.25).toFixed(4),
      timeOffset: `+${Math.round(hours * 0.25)} hr`,
      type: "pickup"
    },
    {
      name: "Midway Plaza",
      locationName: "Highway Rest Stop",
      lat: +(depCoords.lat + (arrCoords.lat - depCoords.lat) * 0.55).toFixed(4),
      lng: +(depCoords.lng + (arrCoords.lng - depCoords.lng) * 0.55).toFixed(4),
      timeOffset: `+${Math.round(hours * 0.5)} hrs`,
      type: "rest"
    },
    {
      name: `${arrivalCity} Entry`,
      locationName: "Outer Ring Stand",
      lat: +(depCoords.lat + (arrCoords.lat - depCoords.lat) * 0.85).toFixed(4),
      lng: +(depCoords.lng + (arrCoords.lng - depCoords.lng) * 0.85).toFixed(4),
      timeOffset: `+${Math.round(hours * 0.85)} hrs`,
      type: "drop"
    }
  ];

  const polyline = [
    [depCoords.lat, depCoords.lng],
    ...stops.map(s => [s.lat, s.lng]),
    [arrCoords.lat, arrCoords.lng]
  ];

  return {
    routeName: `${departureCity || 'Origin'} to ${arrivalCity || 'Destination'}`,
    departure: { name: departureCity || 'Origin', lat: depCoords.lat, lng: depCoords.lng, label: `${departureCity || 'Origin'} Central Bus Station` },
    arrival: { name: arrivalCity || 'Destination', lat: arrCoords.lat, lng: arrCoords.lng, label: `${arrivalCity || 'Destination'} Main Terminal` },
    distanceKm: dist || 200,
    durationFormatted,
    totalStops: stops.length,
    stops,
    polyline,
    busDetails: {
      operatorName: bus?.operatorName || 'Tedbus Express Partner',
      busType: bus?.busType || 'Premium A/C Seater/Sleeper',
      rating: Array.isArray(bus?.rating) && bus.rating.length ? (bus.rating.reduce((a, b) => a + b, 0) / bus.rating.length).toFixed(1) : 4.5
    }
  };
};
