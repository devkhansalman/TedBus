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
        let email = req.get("x-user-email");
        if (!email) {
            email = "demo@tedbus.com";
        }

        let customer = await Customer.findOne({ email }).exec();
        if (!customer) {
            customer = new Customer({
                name: email.split('@')[0] || "Demo User",
                email: email
            });
            await customer.save();
        }

        req.customer = customer;
        next();
    } catch (error) {
        console.error('[Auth Middleware Error] authenticating customer', error);
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

const SUPPORTED_LANGUAGES = ["en", "hi", "fr", "de", "es", "ta"];

exports.getLanguagePreference = (req, res) => {
    res.json({ preferredLanguage: req.customer.preferredLanguage || "en" });
};

exports.updateLanguagePreference = async (req, res) => {
    const { preferredLanguage } = req.body;
    if (!preferredLanguage || !SUPPORTED_LANGUAGES.includes(preferredLanguage)) {
        return res.status(400).json({ error: `preferredLanguage must be one of: ${SUPPORTED_LANGUAGES.join(", ")}` });
    }

    try {
        req.customer.preferredLanguage = preferredLanguage;
        await req.customer.save();
        res.json({ preferredLanguage: req.customer.preferredLanguage });
    } catch (error) {
        console.error('error updating language preference', error);
        res.status(500).json({ error: "internal server error" });
    }
};
