const transporter = require("../config/emailConfig");

const bookingSms = async (req, user) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Booking Successfull",
    html: `<p>Dear ${user.name},</p>
        <p>Thank you for choosing TourTide.
        your booking is confirmed</p>`,
  });
};

module.exports = bookingSms;
