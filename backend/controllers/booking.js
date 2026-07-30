const Booking=require("../models/booking");

exports.addbooking=async(req,res)=>{
    try{
        const booking = await Booking.create(req.body);
        console.log("New booking created:", booking._id);
        res.status(201).send(booking);
    } catch(err){
        console.error("Error creating booking:", err);
        res.status(400).json({error: err.message});
    }
}

exports.getBooking =async(req,res)=>{
    try{
        let {id}=req.params;
        const bookings=await Booking.find().lean().exec();
        let filteredBookings=bookings.filter((booking)=>booking.customerId.toString()== id);
        res.send(filteredBookings);
    } catch(err){
        console.error("Error fetching bookings:", err);
        res.status(500).json({error: err.message});
    }
}