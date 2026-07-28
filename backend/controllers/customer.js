const Customer = require('../models/customer');

exports.addnewcustomer = async (req, res) => {
    try {
        const { name, email, googleId, profilepicture, profilePicture } = req.body;
        const normalizedProfilePicture = profilePicture ?? profilepicture;

        if (!name || !email) {
            return res.status(400).json({ error: "name and email are required" });
        }

        let exisitingcustomer = await Customer.findOne({ email }).lean().exec();
        if (exisitingcustomer) {
            return res.send(exisitingcustomer)
        } else {
            const customer = new Customer({
                name,
                email,
                googleId,
                profilePicture: normalizedProfilePicture
            });
            const newCustomer = await customer.save()
            return res.status(201).json(newCustomer);
        }
    } catch (error) {
        console.error('error adding customer', error);
        res.status(500).json({ error: "internal server error" });
    }
}
