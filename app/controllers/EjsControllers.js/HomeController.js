const { Tour } = require("../../models/tourModel");

class HomeController {
  async homePage(req, res) {
    try {
      const tourData = await Tour.aggregate([{ $limit: 3 }]);

      res.render("home", {
        isAuthenticated: req.isAuthenticated,
        tour: tourData,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async aboutPage(req, res) {
    try {
      res.render("about", { isAuthenticated: req.isAuthenticated });
    } catch (error) {
      console.log(error);
    }
  }

  // async tourdetails(req, res) {
  //   try {
  //     res.render("tourDetails", { isAuthenticated: req.isAuthenticated });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
}

module.exports = new HomeController();
