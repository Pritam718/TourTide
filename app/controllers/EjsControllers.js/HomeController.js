class HomeController {
  async homePage(req, res) {
    try {
      res.render("home");
    } catch (error) {
      console.log(error);
    }
  }
  async aboutPage(req, res) {
    try {
      res.render("about");
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new HomeController();
