const statusCode = require("../../helper/httpsStatusCode");
const { Contact, contactSchemaValidation } = require("../../models/contactModel");
const path = require("path");
const fs = require("fs");
const { log } = require("console");

class ContactController {
    async addContact(req, res) {
        try {
            const { error } = contactSchemaValidation.validate(req.body);
            if (error) {
                req.flash("error_msg", error.details[0].message);
                return res.redirect("/contact");
            }
            const {
                name,
                email,
                subject,
                message,
            } = req.body;

            const contactdata = new Contact({
                name,
                email,
                subject,
                message,
            });
            const data = await contactdata.save();
            //console.log(data)

            res
                .status(statusCode.create)
                .json({ message: "Contact send successfull", data: data });
        } catch (error) {
            console.log(error);
        }
    }
    async getContact(req, res) {
        try {
            const data = await Contact.find({});
            res
                .status(statusCode.success)
                .json({ message: "Get contact details successfully done", data: data });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new ContactController();