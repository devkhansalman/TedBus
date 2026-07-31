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

exports.requireAuthenticatedCustomer = async (req, res, next) => {
    try {
        const email = req.get("x-user-email");
        if (!email) return res.status(401).json({ error: "authentication is required" });

        const customer = await Customer.findOne({ email }).exec();
        if (!customer) return res.status(401).json({ error: "customer session is invalid" });

        req.customer = customer;
        next();
    } catch (error) {
        console.error('error authenticating customer', error);
        res.status(500).json({ error: "internal server error" });
    }
};

exports.getThemePreference = (req, res) => {
    res.json({ themePreference: req.customer.themePreference || "light" });
};

exports.updateThemePreference = async (req, res) => {
    const { themePreference } = req.body;
    if (themePreference !== "light" && themePreference !== "dark") {
        return res.status(400).json({ error: "themePreference must be light or dark" });
    }

    try {
        req.customer.themePreference = themePreference;
        await req.customer.save();
        res.json({ themePreference: req.customer.themePreference });
    } catch (error) {
        console.error('error updating theme preference', error);
        res.status(500).json({ error: "internal server error" });
    }
};
