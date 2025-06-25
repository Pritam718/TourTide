const { reviewValidationSchema, Review } = require("../../models/reviewModel");

class ReviewEjsController {
  async createReview(req, res) {
    try {
      const { error } = reviewValidationSchema.validate(req.body);
      if (error)
        return res.status(400).json({ error: error.details[0].message });

      const newReview = new Review({
        ...req.body,
        user: req.user.userId,
      });

      await newReview.save();
      res
        .status(201)
        .json({ message: "Review added successfully", review: newReview });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new ReviewEjsController();
