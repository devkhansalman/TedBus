const Booking = require("../models/booking");
const notificationService = require("../services/notification.service");

exports.addbooking = async (req, res) => {
    try {
        const booking = await Booking.create(req.body);

        if (booking && booking.email) {
            // Automatically generate Phase 2 notifications: Booking Confirmed & Payment Successful
            await notificationService.notifyBookingConfirmed(booking);
            await notificationService.notifyPaymentSuccessful(booking);
        }

        res.status(201).send(booking);
    } catch (err) {
        console.error("Error creating booking:", err);
        res.status(400).json({ error: err.message });
    }
};

exports.getBooking = async (req, res) => {
    try {
        let { id } = req.params;
        const bookings = await Booking.find().lean().exec();
        let filteredBookings = bookings.filter((booking) => booking.customerId.toString() == id);
        res.send(filteredBookings);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        const normalizedStatus = String(status || '').toLowerCase();
        if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
            await notificationService.notifyBookingCancelled(booking);
        } else if (normalizedStatus === 'completed') {
            await notificationService.notifyJourneyCompleted(booking);
        }

        res.status(200).json(booking);
    } catch (err) {
        console.error("Error updating booking status:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        await notificationService.notifyBookingCancelled(booking);

        res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (err) {
        console.error("Error cancelling booking:", err);
        res.status(500).json({ error: err.message });
    }
};