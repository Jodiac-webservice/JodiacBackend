const controller = require("../Controllers/Orders.Controllers");
const { authJwt } = require("../Middlewares/index");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    // The fix is here:
    // Ensure that you are passing a function as the last argument.
    // Your previous code was correct, so this is just to confirm the structure.
    app.post(
        "/api/Orders/createOrders", 
        [authJwt.verifyToken], 
        controller.createOrder
    );
};