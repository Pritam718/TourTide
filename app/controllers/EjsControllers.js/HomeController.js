class HomeController {
  async homePage(req, res) {
    try {
      res.render("home", { isAuthenticated: req.isAuthenticated });
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
}

module.exports = new HomeController();
