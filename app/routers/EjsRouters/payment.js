const express = require("express");
const router = express.Router();
const razorpay = require("../../config/razorPay");

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `Receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
