const mongoose = require("mongoose");
const Joi = require("joi");

const contactSchemaValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
    }),
    subject: Joi.string().required(),
    message: Joi.string().required(),

});

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true
        },
        subject: {
            type: String,
            require: true
        },
        message: {
            type: String,
            require: true
        }
    }, { timestamps: true }

)

const Contact = mongoose.model("Contact", contactSchema);
module.exports = { Contact, contactSchemaValidation }