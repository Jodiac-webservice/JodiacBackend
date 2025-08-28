const { verifySignUp, authJwt } = require("../Middlewares");
const controller = require("../Controllers/Admin.controllers");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept, x-access-token"
    );
    next();
  });

  // Admin signup
  app.post("/api/auth/adminSignup", controller.adminSignup);
  app.get("/api/getActiveOrders", controller.getActiveOrders);
};
