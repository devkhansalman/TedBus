const Route=require("../models/route");
const Bus=require("../models/bus");
const Booking=require("../models/booking");

exports.getoneroute = async(req,res) => {
    try{
        let departure = req.params.departure;
        let arrival= req.params.arrival;
        let date= req.params.date;

        let routes=await Route.find().lean().exec();
        let route=routes.find((route)=>{
            return(
                route.departureLocation.name.toLowerCase() ==departure.toLowerCase() &&
                route.arrivalLocation.name.toLowerCase() == arrival.toLowerCase()
            );
        });

        // Guard: return 404 if no route found instead of crashing on route._id
        if(!route){
            return res.status(404).json({error: `No route found from ${departure} to ${arrival}`});
        }

        let buses=await Bus.find().lean().exec();
        let matchedbuses=buses.filter((bus)=>{
            return bus.routes.toString() === route._id.toString();
        });

        const booking =await Booking.find().lean().exec();
        const busidwithseatobj={}
        for (let i=0;i<matchedbuses.length;i++){
            let currentbusseats=[]
            const busbooking=booking.filter((booking)=>{
                return(
                    booking.departureDetails.date===date &&
                    booking.busId.toString() === matchedbuses[i]._id.toString()
                );
            });
            busbooking.forEach((booking)=>{
                currentbusseats=[...currentbusseats,...booking.seats];
            });
            busidwithseatobj[matchedbuses[i]._id.toString()]=currentbusseats;
        }
        res.send({route:route,matchedBuses:matchedbuses,busidwithseatobj});
    } catch(err){
        console.error("Error in getoneroute:", err);
        res.status(500).json({error: err.message});
    }
};