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
      console.log(newReview.tour);
      await newReview.save();
      req.flash("success_msg", "Review added successfully");
      res.redirect(`/tourdetails/${newReview.tour}`);

      // res
      //   .status(201)
      //   .json({ message: "Review added successfully", review: newReview });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new ReviewEjsController();
