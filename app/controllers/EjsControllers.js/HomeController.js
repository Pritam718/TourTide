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

  async signinPage(req, res) {
    try {
      res.render("signin");
    } catch (error) {
      console.log(error);
    }
  }

  async signupPage(req, res) {
    try {
      res.render("signup");
    } catch (error) {
      console.log(error);
    }
  }
  
}

module.exports = new HomeController();
