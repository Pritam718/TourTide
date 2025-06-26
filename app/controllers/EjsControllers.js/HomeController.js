const { Tour } = require("../../models/tourModel");

class HomeController {
  async homePage(req, res) {
    try {
      const tourData = await Tour.aggregate([
        {
          $addFields: {
            cityLower: { $toLower: "$address.city" },
          },
        },
        { $group: { _id: "$cityLower", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
        { $limit: 3 },
      ]);
      // console.log(tourData);
      res.render("home", {
        isAuthenticated: req.isAuthenticated,
        user: req.user,
        tour: tourData,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async aboutPage(req, res) {
    try {
      res.render("about", {
        isAuthenticated: req.isAuthenticated,
        user: req.user,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async exploreTopDestination(req, res) {
    try {
      const city = req.params.city;
      const tourData = await Tour.aggregate([
        { $match: { "address.city": { $regex: city, $options: "i" } } },
      ]);
      res.render("tourPackages", {
        tour: tourData,
        isAuthenticated: req.isAuthenticated,
        user: req.user,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async tourdetails(req, res) {
    try {
      res.render("tourDetails", {
        isAuthenticated: req.isAuthenticated,
        user: req.user,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async contactPage(req, res) {
    try {
      res.render("contact", {
        isAuthenticated: req.isAuthenticated,
        user: req.user,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new HomeController();
